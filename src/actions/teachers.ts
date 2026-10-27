"use server";

import { createCrudService } from "@/server/lib";
import { teacherSchema } from "@/schemas";
import type { Teacher, TeacherInput } from "@/models";

const service = createCrudService<unknown, Teacher>({
  model: "teachers",
  idField: "teacher_id",
  orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
  include: { _count: { select: { student_performance: true } } },
  search: { textFields: ["last_name", "first_name", "middle_name", "email"] },
  schema: teacherSchema,
  toDto: ({ _count, ...row }) => ({
    ...row,
    attestations_count: _count.student_performance,
  }),
  messages: {
    notFound: "Преподаватель не найден",
    unique: "Преподаватель с таким email уже существует",
    inUse: "Преподавателя нельзя удалить: он указан в записях успеваемости",
    foreignKey: "Неверные связанные данные",
  },
});

export async function getTeachers(q?: string): Promise<Teacher[]> {
  return service.list(q);
}

export async function getTeacher(id: string): Promise<Teacher> {
  return service.getById(id);
}

export async function createTeacher(data: TeacherInput): Promise<Teacher> {
  return service.create(data);
}

export async function updateTeacher(
  id: string,
  data: TeacherInput,
): Promise<Teacher> {
  return service.update(id, data);
}

export async function deleteTeacher(id: string): Promise<void> {
  return service.remove(id);
}
