import { registerCrud } from "../lib/crud.js";

export default async function subjectsRoutes(app) {
  registerCrud(app, {
    model: "subjects",
    idField: "subject_id",
    orderBy: { subject_name: "asc" },
    // Поля поиска (можно менять): код и название
    search: { textFields: ["subject_code", "subject_name"] },
    decimalFields: ["credits"],
    // Decimal из Prisma превращаем в число, чтобы frontend получал 3, а не "3"
    toDto: (row) => ({ ...row, credits: Number(row.credits) }),
    bodySchema: {
      type: "object",
      required: ["subject_code", "subject_name", "total_hours", "credits"],
      additionalProperties: false,
      properties: {
        subject_code: { type: "string", minLength: 1, maxLength: 20 },
        subject_name: { type: "string", minLength: 1, maxLength: 150 },
        total_hours: { type: "integer", minimum: 1, maximum: 32767 },
        credits: { type: "number", minimum: 0, maximum: 30 },
      },
    },
    messages: {
      notFound: "Дисциплина не найдена",
      unique: "Дисциплина с таким кодом или названием уже существует",
      inUse: "Дисциплину нельзя удалить: по ней есть записи успеваемости",
      foreignKey: "Неверные связанные данные",
    },
  });
}
