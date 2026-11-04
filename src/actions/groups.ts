"use server";

import { createCrudService } from "@/server/lib";
import { groupSchema } from "@/schemas";
import type { Group, GroupInput } from "@/models";
import { prisma } from "@/server/lib";
import { requireAnyPermission } from "@/server/auth/session";

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
  readPermission: null,
  messages: {
    notFound: "Группа не найдена",
    unique: "Группа с таким кодом уже существует",
    inUse: "Группу нельзя удалить: в ней есть студенты",
    foreignKey: "Неверные связанные данные",
  },
});

export async function getGroups(q?: string): Promise<Group[]> {
  const auth = await requireAnyPermission(["dictionaries.read", "session.schedule.read.own"]);
  if (auth.permissions.has("dictionaries.read")) return service.list(q);
  if (!auth.studentId) return [];
  const student = await prisma.students.findUnique({
    where: { student_id: auth.studentId },
    select: { student_groups: { include: { _count: { select: { students: true } } } } },
  });
  if (!student) return [];
  const group = student.student_groups;
  return [{
    group_id: String(group.group_id),
    group_code: group.group_code,
    group_name: group.group_name,
    education_program: group.education_program,
    admission_year: group.admission_year,
    students_count: group._count.students,
  }];
}

export async function getGroup(id: string): Promise<Group> {
  const auth = await requireAnyPermission(["dictionaries.read", "session.schedule.read.own"]);
  if (!auth.permissions.has("dictionaries.read")) {
    if (!auth.studentId) throw new Error("Доступ запрещён");
    const own = await prisma.students.findUnique({
      where: { student_id: auth.studentId },
      select: { group_id: true },
    });
    if (!own || String(own.group_id) !== String(id)) throw new Error("Доступ разрешён только к своей группе");
  }
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
