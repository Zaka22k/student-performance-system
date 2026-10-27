"use server";

import { createCrudService } from "@/server/lib";
import { groupSchema } from "@/schemas";
import type { Group, GroupInput } from "@/models";

const service = createCrudService<unknown, Group>({
  model: "student_groups",
  idField: "group_id",
  orderBy: { group_code: "asc" },
  include: { _count: { select: { students: true } } },
  search: {
    textFields: ["group_code", "group_name", "education_program"],
    numberFields: ["admission_year"],
  },
  schema: groupSchema,
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

export async function getGroups(q?: string): Promise<Group[]> {
  return service.list(q);
}

export async function getGroup(id: string): Promise<Group> {
  return service.getById(id);
}

export async function createGroup(data: GroupInput): Promise<Group> {
  return service.create(data);
}

export async function updateGroup(
  id: string,
  data: GroupInput,
): Promise<Group> {
  return service.update(id, data);
}

export async function deleteGroup(id: string): Promise<void> {
  return service.remove(id);
}
