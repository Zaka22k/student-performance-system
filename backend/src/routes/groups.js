import { registerCrud } from "../lib/crud.js";

export default async function groupsRoutes(app) {
  registerCrud(app, {
    model: "student_groups",
    idField: "group_id",
    orderBy: { group_code: "asc" },
    include: { _count: { select: { students: true } } },
    search: {
      textFields: ["group_code", "group_name", "education_program"],
      numberFields: ["admission_year"],
    },
    bodySchema: {
      type: "object",
      required: [
        "group_code",
        "group_name",
        "education_program",
        "admission_year",
      ],
      additionalProperties: false,
      properties: {
        group_code: { type: "string", minLength: 1, maxLength: 20 },
        group_name: { type: "string", minLength: 1, maxLength: 100 },
        education_program: { type: "string", minLength: 1, maxLength: 200 },
        admission_year: { type: "integer", minimum: 2000, maximum: 2100 },
      },
    },
    // В список добавляется число студентов группы
    toDto: ({ _count, ...row }) => ({
      ...row,
      students_count: _count.students,
    }),
    messages: {
      notFound: "Группа не найдена",
      unique: "Группа с таким кодом уже существует",
      inUse: "Группу нельзя удалить: в ней есть студенты",
      foreignKey: "Неверные связанные данные",
    },
  });
}
