import { registerCrud, idParams } from "../lib/crud.js";

const EMAIL = "^(|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})$";

export default async function studentsRoutes(app) {
  registerCrud(app, {
    model: "students",
    idField: "student_id",
    orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
    include: { student_groups: true },
    // Поля поиска (можно менять): ФИО, номер студенческого, email и код группы
    search: {
      textFields: [
        "last_name",
        "first_name",
        "middle_name",
        "student_number",
        "email",
        "student_groups.group_code",
      ],
    },
    nullable: ["middle_name", "email"],
    dateFields: ["birth_date"],
    bigintFields: ["group_id"],
    bodySchema: {
      type: "object",
      required: ["student_number", "last_name", "first_name", "birth_date", "status", "group_id"],
      additionalProperties: false,
      properties: {
        student_number: { type: "string", minLength: 1, maxLength: 20 },
        last_name: { type: "string", minLength: 1, maxLength: 50 },
        first_name: { type: "string", minLength: 1, maxLength: 50 },
        middle_name: { type: ["string", "null"], maxLength: 50 },
        birth_date: { type: "string", format: "date" },
        email: { type: ["string", "null"], maxLength: 254, pattern: EMAIL },
        status: { enum: ["active", "academic_leave", "expelled", "graduated"] },
        group_id: { type: "integer", minimum: 1 },
      },
    },
    // Вместо вложенной группы отдаём её код и название
    toDto: ({ student_groups, ...row }) => ({
      ...row,
      group_code: student_groups?.group_code,
      group_name: student_groups?.group_name,
    }),
    messages: {
      notFound: "Студент не найден",
      unique: "Студент с таким номером уже существует",
      inUse: "Студента нельзя удалить: у него есть записи успеваемости",
      foreignKey: "Указана несуществующая группа",
    },
  });

  // Оценки студента для страницы просмотра записи
  app.get("/:id/performance", { schema: { params: idParams } }, async (request) => {
    const rows = await app.prisma.student_performance.findMany({
      where: { student_id: BigInt(request.params.id) },
      include: { subjects: true, teachers: true, semesters: true },
      orderBy: [{ semester_id: "asc" }, { assessment_date: "asc" }],
    });

    return rows.map((row) => ({
      performance_id: row.performance_id,
      subject_name: row.subjects.subject_name,
      teacher_name: `${row.teachers.last_name} ${row.teachers.first_name}`,
      semester: `${row.semesters.academic_year_start}/${row.semesters.academic_year_start + 1}, семестр ${row.semesters.term_number}`,
      assessment_type: row.assessment_type,
      grade: row.grade,
      passed: row.passed,
      attempt_number: row.attempt_number,
      assessment_date: row.assessment_date.toISOString().slice(0, 10),
    }));
  });
}
