"use server";

import { createCrudService } from "@/server";
import { semesterSchema } from "@/schemas";
import type { Semester, SemesterInput } from "@/models";

const service = createCrudService<unknown, Semester>({
  model: "semesters",
  idField: "semester_id",
  orderBy: [{ academic_year_start: "desc" }, { term_number: "desc" }],
  search: {
    numberFields: ["academic_year_start", "term_number"],
  },
  dateFields: ["start_date", "end_date"],
  schema: semesterSchema,
  messages: {
    notFound: "Семестр не найден",
    unique: "Такой семестр уже существует",
    inUse: "Семестр нельзя удалить: в нём есть записи успеваемости",
    foreignKey: "Неверные связанные данные",
  },
});

export async function getSemesters(q?: string): Promise<Semester[]> {
  return service.list(q);
}

export async function getSemester(id: string): Promise<Semester> {
  return service.getById(id);
}

export async function createSemester(data: SemesterInput): Promise<Semester> {
  return service.create(data);
}

export async function updateSemester(
  id: string,
  data: SemesterInput,
): Promise<Semester> {
  return service.update(id, data);
}

export async function deleteSemester(id: string): Promise<void> {
  return service.remove(id);
}
