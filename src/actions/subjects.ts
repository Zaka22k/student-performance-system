"use server";

import { createCrudService } from "@/server/lib";
import { subjectSchema } from "@/schemas";
import type { Subject, SubjectInput } from "@/models";

const service = createCrudService<unknown, Subject>({
  model: "subjects",
  idField: "subject_id",
  orderBy: { subject_name: "asc" },
  search: {
    textFields: ["subject_code", "subject_name"],
    numberFields: ["total_hours"],
  },
  schema: subjectSchema,
  toDto: (row) => ({
    ...row,
    credits: Number(row.credits),
  }),
  messages: {
    notFound: "Дисциплина не найдена",
    unique: "Дисциплина с таким кодом или названием уже существует",
    inUse: "Дисциплину нельзя удалить: по ней есть записи успеваемости",
    foreignKey: "Неверные связанные данные",
  },
});

export async function getSubjects(q?: string): Promise<Subject[]> {
  return service.list(q);
}

export async function getSubject(id: string): Promise<Subject> {
  return service.getById(id);
}

export async function createSubject(data: SubjectInput): Promise<Subject> {
  return service.create(data);
}

export async function updateSubject(
  id: string,
  data: SubjectInput,
): Promise<Subject> {
  return service.update(id, data);
}

export async function deleteSubject(id: string): Promise<void> {
  return service.remove(id);
}
