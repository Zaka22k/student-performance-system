import { buildSearchWhere } from "../lib/crud.js";

const ASSESSMENT_TYPES = ["exam", "credit", "differentiated_credit", "coursework"];
const ID = { type: "string", pattern: "^[0-9]+$" };

// Поля поиска по расписанию (можно менять): группа, дисциплина, преподаватель
const SCHEDULE_SEARCH = {
  textFields: [
    "students.student_groups.group_code",
    "subjects.subject_name",
    "subjects.subject_code",
    "teachers.last_name",
    "teachers.first_name",
  ],
};

const fullName = (p) => [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");
const isoDate = (d) => d.toISOString().slice(0, 10);

const sheetBody = {
  type: "object",
  required: [
    "group_id",
    "subject_id",
    "teacher_id",
    "semester_id",
    "assessment_type",
    "attempt_number",
    "assessment_date",
  ],
  additionalProperties: false,
  properties: {
    group_id: { type: "integer", minimum: 1 },
    subject_id: { type: "integer", minimum: 1 },
    teacher_id: { type: "integer", minimum: 1 },
    semester_id: { type: "integer", minimum: 1 },
    assessment_type: { enum: ASSESSMENT_TYPES },
    attempt_number: { type: "integer", minimum: 1, maximum: 3 },
    assessment_date: { type: "string", format: "date" },
    // Оценки студентов; для зачёта не нужны: всем ставится «Сдано»
    grades: {
      type: "array",
      maxItems: 500,
      items: {
        type: "object",
        required: ["student_id", "grade"],
        additionalProperties: false,
        properties: {
          student_id: { type: "integer", minimum: 1 },
          grade: { type: "integer", minimum: 2, maximum: 5 },
        },
      },
    },
  },
};

export default async function sessionRoutes(app) {
  const prisma = () => app.prisma;

  // Расписание: GET /session/schedule?semester_id=1&group_id=2&q=...
  // Отдельной таблицы расписания нет: строки собираются из записей журнала
  // (одна строка = дата + группа + дисциплина + вид контроля + попытка + преподаватель).
  app.get(
    "/schedule",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["semester_id"],
          properties: {
            semester_id: ID,
            group_id: ID,
            q: { type: "string", maxLength: 100 },
          },
        },
      },
    },
    async (request) => {
      const { semester_id, group_id, q } = request.query;

      const conditions = [{ semester_id: BigInt(semester_id) }, buildSearchWhere(q, SCHEDULE_SEARCH)];
      if (group_id) conditions.push({ students: { group_id: BigInt(group_id) } });

      const rows = await prisma().student_performance.findMany({
        where: { AND: conditions.filter(Boolean) },
        include: { students: { include: { student_groups: true } }, subjects: true, teachers: true },
      });

      const items = new Map();
      for (const row of rows) {
        const date = isoDate(row.assessment_date);
        const key = [
          date,
          row.students.group_id,
          row.subject_id,
          row.assessment_type,
          row.attempt_number,
          row.teacher_id,
        ].join("|");

        const item = items.get(key) ?? {
          assessment_date: date,
          group_id: row.students.group_id,
          group_code: row.students.student_groups.group_code,
          subject_id: row.subject_id,
          subject_name: row.subjects.subject_name,
          teacher_id: row.teacher_id,
          teacher_name: fullName(row.teachers),
          assessment_type: row.assessment_type,
          attempt_number: row.attempt_number,
          students_count: 0,
        };
        item.students_count++;
        items.set(key, item);
      }

      return [...items.values()].sort(
        (a, b) =>
          a.assessment_date.localeCompare(b.assessment_date) ||
          a.group_code.localeCompare(b.group_code, "ru") ||
          a.subject_name.localeCompare(b.subject_name, "ru"),
      );
    },
  );

  // Формирование ведомости: по одной записи в журнале для каждого студента группы со статусом «Учится».
  // Зачёт: всем «Сдано». Остальные виды: оценки приходят в grades (БД не допускает запись без оценки).
  app.post("/sheet", { schema: { body: sheetBody } }, async (request, reply) => {
    const body = request.body;
    const isCredit = body.assessment_type === "credit";

    const students = await prisma().students.findMany({
      where: { group_id: BigInt(body.group_id), status: "active" },
      orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
      select: { student_id: true, last_name: true, first_name: true, middle_name: true },
    });
    if (students.length === 0) {
      return reply.code(400).send({ message: "В группе нет студентов со статусом «Учится»" });
    }

    const gradeById = new Map((body.grades ?? []).map((g) => [String(g.student_id), g.grade]));
    if (!isCredit) {
      const missing = students.filter((s) => !gradeById.has(String(s.student_id)));
      if (missing.length > 0) {
        const names = missing.slice(0, 3).map(fullName).join(", ");
        const more = missing.length > 3 ? ` и ещё ${missing.length - 3}` : "";
        return reply.code(400).send({ message: `Не указана оценка: ${names}${more}` });
      }
    }

    // У группы не должно быть записей по этой дисциплине, семестру, виду контроля и попытке
    const existing = await prisma().student_performance.count({
      where: {
        student_id: { in: students.map((s) => s.student_id) },
        subject_id: BigInt(body.subject_id),
        semester_id: BigInt(body.semester_id),
        assessment_type: body.assessment_type,
        attempt_number: body.attempt_number,
      },
    });
    if (existing > 0) {
      return reply.code(409).send({
        message: `Ведомость уже сформирована: по этой дисциплине, семестру, виду контроля и попытке записи есть у ${existing} студентов группы`,
      });
    }

    try {
      // Один INSERT: либо создаются все записи, либо ни одной. Рейтинг пересчитывают триггеры БД
      const result = await prisma().student_performance.createMany({
        data: students.map((s) => ({
          student_id: s.student_id,
          subject_id: BigInt(body.subject_id),
          teacher_id: BigInt(body.teacher_id),
          semester_id: BigInt(body.semester_id),
          assessment_type: body.assessment_type,
          grade: isCredit ? null : gradeById.get(String(s.student_id)),
          passed: isCredit ? true : null,
          attempt_number: body.attempt_number,
          assessment_date: new Date(body.assessment_date),
        })),
      });
      return reply.code(201).send({ created: result.count });
    } catch (error) {
      if (error.code === "P2002") {
        return reply.code(409).send({ message: "Ведомость уже сформирована: такие записи есть в журнале" });
      }
      if (error.code === "P2003") {
        return reply.code(400).send({ message: "Указаны несуществующие группа, дисциплина, преподаватель или семестр" });
      }
      throw error;
    }
  });
}
