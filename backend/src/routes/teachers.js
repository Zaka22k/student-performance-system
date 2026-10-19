import { registerCrud } from "../lib/crud.js";

const EMAIL = "^(|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})$";

export default async function teachersRoutes(app) {
  registerCrud(app, {
    model: "teachers",
    idField: "teacher_id",
    orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
    include: { _count: { select: { student_performance: true } } },
    // Поля поиска (можно менять): ФИО и email
    search: { textFields: ["last_name", "first_name", "middle_name", "email"] },
    nullable: ["middle_name", "email"],
    bodySchema: {
      type: "object",
      required: ["last_name", "first_name"],
      additionalProperties: false,
      properties: {
        last_name: { type: "string", minLength: 1, maxLength: 50 },
        first_name: { type: "string", minLength: 1, maxLength: 50 },
        middle_name: { type: ["string", "null"], maxLength: 50 },
        email: { type: ["string", "null"], maxLength: 254, pattern: EMAIL },
      },
    },
    // В список добавляется число проведённых аттестаций
    toDto: ({ _count, ...row }) => ({ ...row, attestations_count: _count.student_performance }),
    messages: {
      notFound: "Преподаватель не найден",
      unique: "Преподаватель с таким email уже существует",
      inUse: "Преподавателя нельзя удалить: он указан в записях успеваемости",
      foreignKey: "Неверные связанные данные",
    },
  });
}
