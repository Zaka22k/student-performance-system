import { buildSearchWhere, idParams } from "../lib/crud.js";

const DEFAULT_LIMIT = 50;

// Связи подтягиваем одним запросом: студент (с группой), дисциплина, преподаватель, семестр
const INCLUDE = {
  students: { include: { student_groups: true } },
  subjects: true,
  teachers: true,
  semesters: true,
};

// Поля поиска (можно менять): студент, номер, группа, дисциплина, преподаватель
const SEARCH = {
  textFields: [
    "students.last_name",
    "students.first_name",
    "students.middle_name",
    "students.student_number",
    "students.student_groups.group_code",
    "subjects.subject_name",
    "subjects.subject_code",
    "teachers.last_name",
    "teachers.first_name",
  ],
};

const MESSAGES = {
  notFound: "Запись успеваемости не найдена",
  unique:
    "Такая запись уже есть: студент, дисциплина, семестр, вид контроля и номер попытки совпадают",
  foreignKey: "Указаны несуществующие студент, дисциплина, преподаватель или семестр",
};

const bodySchema = {
  type: "object",
  required: [
    "student_id",
    "subject_id",
    "teacher_id",
    "semester_id",
    "assessment_type",
    "attempt_number",
    "assessment_date",
  ],
  additionalProperties: false,
  properties: {
    student_id: { type: "integer", minimum: 1 },
    subject_id: { type: "integer", minimum: 1 },
    teacher_id: { type: "integer", minimum: 1 },
    semester_id: { type: "integer", minimum: 1 },
    assessment_type: { enum: ["exam", "credit", "differentiated_credit", "coursework"] },
    grade: { type: ["integer", "null"], minimum: 2, maximum: 5 },
    passed: { type: ["boolean", "null"] },
    attempt_number: { type: "integer", minimum: 1, maximum: 3 },
    assessment_date: { type: "string", format: "date" },
  },
};

const fullName = (p) => [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");

const toDto = (row) => ({
  performance_id: row.performance_id,
  student_id: row.student_id,
  student_number: row.students.student_number,
  student_name: fullName(row.students),
  group_code: row.students.student_groups.group_code,
  subject_id: row.subject_id,
  subject_name: row.subjects.subject_name,
  teacher_id: row.teacher_id,
  teacher_name: fullName(row.teachers),
  semester_id: row.semester_id,
  academic_year_start: row.semesters.academic_year_start,
  term_number: row.semesters.term_number,
  assessment_type: row.assessment_type,
  grade: row.grade,
  passed: row.passed,
  attempt_number: row.attempt_number,
  assessment_date: row.assessment_date.toISOString().slice(0, 10),
});

// Курсор = дата и id последней записи страницы. Список упорядочен по дате (новые сверху), затем по id.
// Такой курсор не ломается, если запись, на которой остановились, удалили между запросами.
const encodeCursor = (row) =>
  Buffer.from(`${row.assessment_date.toISOString().slice(0, 10)}|${row.performance_id}`).toString("base64url");

const decodeCursor = (cursor) => {
  const [date, id] = Buffer.from(cursor, "base64url").toString().split("|");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "") || !/^\d+$/.test(id ?? "")) return null;
  return { date: new Date(date), id: BigInt(id) };
};

// Приводит результат к виду, который требует БД: зачёт без оценки, остальное без признака «сдал»
function normalize(body) {
  const data = {
    student_id: BigInt(body.student_id),
    subject_id: BigInt(body.subject_id),
    teacher_id: BigInt(body.teacher_id),
    semester_id: BigInt(body.semester_id),
    assessment_type: body.assessment_type,
    attempt_number: body.attempt_number,
    assessment_date: new Date(body.assessment_date),
  };

  if (body.assessment_type === "credit") {
    if (typeof body.passed !== "boolean") return { problem: "Укажите, сдан ли зачёт" };
    return { data: { ...data, grade: null, passed: body.passed } };
  }
  if (typeof body.grade !== "number") return { problem: "Укажите оценку от 2 до 5" };
  return { data: { ...data, grade: body.grade, passed: null } };
}

function dbError(error, reply) {
  if (error.code === "P2002") return reply.code(409).send({ message: MESSAGES.unique });
  if (error.code === "P2003") return reply.code(400).send({ message: MESSAGES.foreignKey });
  if (error.code === "P2025") return reply.code(404).send({ message: MESSAGES.notFound });
  throw error;
}

export default async function performanceRoutes(app) {
  const performance = () => app.prisma.student_performance;
  const where = (id) => ({ performance_id: BigInt(id) });

  // Список порциями: GET /performance?q=...&cursor=...&limit=50
  // Ответ: { items, nextCursor }, nextCursor === null, когда записи кончились
  app.get(
    "/",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            q: { type: "string", maxLength: 100 },
            cursor: { type: "string", maxLength: 100 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: DEFAULT_LIMIT },
          },
        },
      },
    },
    async (request, reply) => {
      const { q, cursor, limit } = request.query;
      const conditions = [buildSearchWhere(q, SEARCH)];

      if (cursor) {
        const c = decodeCursor(cursor);
        if (!c) return reply.code(400).send({ message: "Неверный курсор" });
        conditions.push({
          OR: [
            { assessment_date: { lt: c.date } },
            { assessment_date: c.date, performance_id: { lt: c.id } },
          ],
        });
      }

      // Берём на одну запись больше: так видно, есть ли следующая порция
      const rows = await performance().findMany({
        where: { AND: conditions.filter(Boolean) },
        orderBy: [{ assessment_date: "desc" }, { performance_id: "desc" }],
        take: limit + 1,
        include: INCLUDE,
      });

      const hasMore = rows.length > limit;
      const page = hasMore ? rows.slice(0, limit) : rows;

      return {
        items: page.map(toDto),
        nextCursor: hasMore ? encodeCursor(page[page.length - 1]) : null,
      };
    },
  );

  // Одна запись (для страницы редактирования)
  app.get("/:id", { schema: { params: idParams } }, async (request, reply) => {
    const row = await performance().findUnique({ where: where(request.params.id), include: INCLUDE });
    if (!row) return reply.code(404).send({ message: MESSAGES.notFound });
    return toDto(row);
  });

  // Добавление. Рейтинг студента пересчитывает триггер в БД
  app.post("/", { schema: { body: bodySchema } }, async (request, reply) => {
    const { data, problem } = normalize(request.body);
    if (problem) return reply.code(400).send({ message: problem });

    try {
      const row = await performance().create({ data, include: INCLUDE });
      return reply.code(201).send(toDto(row));
    } catch (error) {
      return dbError(error, reply);
    }
  });

  // Изменение (запись целиком). Какие поля можно менять, решает форма на frontend
  app.put("/:id", { schema: { params: idParams, body: bodySchema } }, async (request, reply) => {
    const { data, problem } = normalize(request.body);
    if (problem) return reply.code(400).send({ message: problem });

    try {
      const row = await performance().update({
        where: where(request.params.id),
        data,
        include: INCLUDE,
      });
      return toDto(row);
    } catch (error) {
      return dbError(error, reply);
    }
  });

  app.delete("/:id", { schema: { params: idParams } }, async (request, reply) => {
    try {
      await performance().delete({ where: where(request.params.id) });
      return reply.code(204).send();
    } catch (error) {
      return dbError(error, reply);
    }
  });
}
