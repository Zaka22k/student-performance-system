import { registerCrud } from "../lib/crud.js";

export default async function semestersRoutes(app) {
  registerCrud(app, {
    model: "semesters",
    idField: "semester_id",
    orderBy: [{ academic_year_start: "asc" }, { term_number: "asc" }],
    // Текстовых полей нет, поэтому ищем по числам: год начала и номер семестра
    search: { textFields: [], numberFields: ["academic_year_start", "term_number"] },
    dateFields: ["start_date", "end_date"],
    bodySchema: {
      type: "object",
      required: ["academic_year_start", "term_number", "start_date", "end_date"],
      additionalProperties: false,
      properties: {
        academic_year_start: { type: "integer", minimum: 2000, maximum: 2100 },
        term_number: { enum: [1, 2] },
        start_date: { type: "string", format: "date" },
        end_date: { type: "string", format: "date" },
      },
    },
    validate: (data) =>
      data.start_date >= data.end_date ? "Дата начала должна быть раньше даты окончания" : null,
    messages: {
      notFound: "Семестр не найден",
      unique: "Такой семестр уже существует",
      inUse: "Семестр нельзя удалить: по нему есть записи успеваемости",
      foreignKey: "Неверные связанные данные",
    },
  });
}
