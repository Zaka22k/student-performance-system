"use server";

import { prisma } from "@/server/lib/prisma";
import { hashPassword, requirePermission } from "@/server/auth/session";

const parseId = (value: string, label: string): bigint => {
  const normalized = String(value ?? "").trim();
  if (!/^\d+$/.test(normalized) || normalized === "0") {
    throw new Error(`Некорректный идентификатор: ${label}`);
  }
  return BigInt(normalized);
};

async function writeAudit(
  actorUserId: bigint,
  action: string,
  targetType: string,
  targetId: string,
  details?: Record<string, unknown>,
) {
  await prisma.audit_logs.create({
    data: {
      actor_user_id: actorUserId,
      action,
      target_type: targetType,
      target_id: targetId,
      details: details ? JSON.parse(JSON.stringify(details)) : undefined,
    },
  });
}

export async function getAdminUsers() {
  await requirePermission("users.manage");
  const users = await prisma.users.findMany({
    orderBy: { username: "asc" },
    select: {
      user_id: true,
      username: true,
      is_active: true,
      created_at: true,
      role_id: true,
      student_id: true,
      teacher_id: true,
      roles: { select: { role_code: true, role_name: true } },
      students: {
        select: { last_name: true, first_name: true, student_number: true },
      },
      teachers: {
        select: { last_name: true, first_name: true, middle_name: true },
      },
      _count: { select: { sessions: true } },
    },
  });
  return users.map((user) => ({
    user_id: String(user.user_id),
    username: user.username,
    is_active: user.is_active,
    created_at: user.created_at.toISOString(),
    role_id: String(user.role_id),
    role_code: user.roles.role_code,
    role_name: user.roles.role_name,
    student_id: user.student_id === null ? null : String(user.student_id),
    teacher_id: user.teacher_id === null ? null : String(user.teacher_id),
    linked_name: user.students
      ? `${user.students.last_name} ${user.students.first_name} · ${user.students.student_number}`
      : user.teachers
        ? [user.teachers.last_name, user.teachers.first_name, user.teachers.middle_name]
            .filter(Boolean).join(" ")
        : null,
    active_sessions: user._count.sessions,
  }));
}

export async function getAssignableRoles() {
  await requirePermission("users.manage");
  const roles = await prisma.roles.findMany({
    orderBy: { role_id: "asc" },
    select: { role_id: true, role_code: true, role_name: true },
  });
  return roles.map((role) => ({ ...role, role_id: String(role.role_id) }));
}

export async function createUser(input: {
  username: string;
  password: string;
  role_id: string;
  student_id?: string | null;
  teacher_id?: string | null;
}) {
  const actor = await requirePermission("users.manage");
  if (
    !input ||
    typeof input.username !== "string" ||
    typeof input.password !== "string" ||
    typeof input.role_id !== "string"
  ) throw new Error("Некорректные данные учётной записи");
  const username = input.username.trim();
  if (!/^[a-zA-Z0-9._-]{3,80}$/.test(username)) {
    throw new Error("Логин должен содержать 3–80 символов: латинские буквы, цифры, точку, дефис или подчёркивание");
  }
  if (input.password.length < 12 || input.password.length > 128) {
    throw new Error("Пароль должен содержать от 12 до 128 символов");
  }

  const roleId = parseId(input.role_id, "роль");
  const studentId = input.student_id ? parseId(input.student_id, "студент") : null;
  const teacherId = input.teacher_id ? parseId(input.teacher_id, "преподаватель") : null;
  if (studentId && teacherId) throw new Error("Нельзя одновременно привязать студента и преподавателя");

  const role = await prisma.roles.findUnique({ where: { role_id: roleId } });
  if (!role) throw new Error("Роль не найдена");
  if (role.role_code === "student" && (!studentId || teacherId)) {
    throw new Error("Для роли student требуется привязать студента");
  }
  if (role.role_code === "teacher" && (!teacherId || studentId)) {
    throw new Error("Для роли teacher требуется привязать преподавателя");
  }
  if (role.role_code === "admin" && (studentId || teacherId)) {
    throw new Error("Для роли admin не нужно указывать привязку к студенту или преподавателю");
  }

  const user = await prisma.users.create({
    data: {
      username,
      password_hash: await hashPassword(input.password),
      role_id: roleId,
      student_id: studentId,
      teacher_id: teacherId,
    },
    select: { user_id: true },
  });
  await writeAudit(actor.userId, "users.create", "user", String(user.user_id), {
    username,
    role_code: role.role_code,
  });
  return { user_id: String(user.user_id) };
}

export async function changeUserRole(userId: string, roleId: string) {
  const actor = await requirePermission("users.manage");
  const id = parseId(userId, "пользователь");
  const nextRoleId = parseId(roleId, "роль");
  const [user, role] = await Promise.all([
    prisma.users.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        role_id: true,
        student_id: true,
        teacher_id: true,
        is_active: true,
        roles: { select: { role_code: true } },
      },
    }),
    prisma.roles.findUnique({
      where: { role_id: nextRoleId },
      select: { role_code: true },
    }),
  ]);
  if (!user || !role) throw new Error("Пользователь или роль не найдены");
  if (user.is_active && user.roles.role_code === "admin" && role.role_code !== "admin") {
    const adminRole = await prisma.roles.findUnique({
      where: { role_code: "admin" },
      select: { role_id: true },
    });
    const activeAdmins = adminRole
      ? await prisma.users.count({ where: { role_id: adminRole.role_id, is_active: true } })
      : 0;
    if (activeAdmins <= 1) throw new Error("Нельзя снять роль admin с последнего активного администратора");
  }
  if (role.role_code === "student" && (!user.student_id || user.teacher_id)) {
    throw new Error("Для роли student у пользователя должна быть привязка к студенту");
  }
  if (role.role_code === "teacher" && (!user.teacher_id || user.student_id)) {
    throw new Error("Для роли teacher у пользователя должна быть привязка к преподавателю");
  }
  if (role.role_code === "admin" && (user.student_id || user.teacher_id)) {
    throw new Error("Перед назначением admin удалите привязку к студенту/преподавателю");
  }

  await prisma.users.update({ where: { user_id: id }, data: { role_id: nextRoleId } });
  await writeAudit(actor.userId, "users.role.change", "user", String(id), {
    new_role: role.role_code,
  });
  return { ok: true };
}

export async function setUserActive(userId: string, isActive: boolean) {
  const actor = await requirePermission("users.manage");
  if (typeof isActive !== "boolean") throw new Error("Некорректное состояние пользователя");
  const id = parseId(userId, "пользователь");
  if (!isActive && id === actor.userId) {
    throw new Error("Нельзя заблокировать собственную учётную запись");
  }
  const target = await prisma.users.findUnique({
    where: { user_id: id },
    select: { role_id: true, is_active: true },
  });
  if (!target) throw new Error("Пользователь не найден");
  if (!isActive && target.is_active) {
    const adminRole = await prisma.roles.findUnique({
      where: { role_code: "admin" },
      select: { role_id: true },
    });
    if (adminRole && target.role_id === adminRole.role_id) {
      const activeAdmins = await prisma.users.count({
        where: { role_id: adminRole.role_id, is_active: true },
      });
      if (activeAdmins <= 1) throw new Error("Нельзя заблокировать последнего активного администратора");
    }
  }
  await prisma.users.update({
    where: { user_id: id },
    data: { is_active: isActive },
  });
  await writeAudit(actor.userId, isActive ? "users.activate" : "users.deactivate", "user", String(id));
  return { ok: true };
}

export async function resetUserPassword(userId: string, password: string) {
  const actor = await requirePermission("users.manage");
  if (typeof password !== "string" || password.length < 12 || password.length > 128) {
    throw new Error("Пароль должен содержать от 12 до 128 символов");
  }
  const id = parseId(userId, "пользователь");
  await prisma.users.update({
    where: { user_id: id },
    data: { password_hash: await hashPassword(password) },
  });
  await writeAudit(actor.userId, "users.password.reset", "user", String(id));
  return { ok: true };
}


export async function createRole(input: {
  role_code: string;
  role_name: string;
  description?: string;
}) {
  const actor = await requirePermission("roles.manage");
  if (!input || typeof input.role_code !== "string" || typeof input.role_name !== "string") {
    throw new Error("Некорректные данные роли");
  }
  const roleCode = input.role_code.trim().toLowerCase();
  const roleName = input.role_name.trim();
  if (!/^[a-z][a-z0-9_-]{1,49}$/.test(roleCode)) {
    throw new Error("Код роли должен содержать 2–50 символов: латинские буквы, цифры, дефис и подчёркивание");
  }
  if (!roleName || roleName.length > 100) throw new Error("Укажите название роли (до 100 символов)");
  const role = await prisma.roles.create({
    data: {
      role_code: roleCode,
      role_name: roleName,
      description: input.description?.trim() || null,
    },
    select: { role_id: true },
  });
  await writeAudit(actor.userId, "roles.create", "role", String(role.role_id), { role_code: roleCode });
  return { role_id: String(role.role_id) };
}

export async function deleteRole(roleId: string) {
  const actor = await requirePermission("roles.manage");
  const id = parseId(roleId, "роль");
  const role = await prisma.roles.findUnique({
    where: { role_id: id },
    select: { role_code: true },
  });
  if (!role) throw new Error("Роль не найдена");
  if (["admin", "teacher", "student"].includes(role.role_code)) {
    throw new Error("Базовые роли системы нельзя удалить");
  }
  await prisma.roles.delete({ where: { role_id: id } });
  await writeAudit(actor.userId, "roles.delete", "role", String(id), { role_code: role.role_code });
  return { ok: true };
}

export async function getRolePermissionMatrix() {
  await requirePermission("roles.manage");
  const [roles, permissions, links] = await Promise.all([
    prisma.roles.findMany({ orderBy: { role_id: "asc" } }),
    prisma.permissions.findMany({ orderBy: { permission_code: "asc" } }),
    prisma.role_permissions.findMany(),
  ]);
  const granted = new Map<string, string[]>();
  for (const link of links) {
    const roleId = String(link.role_id);
    const list = granted.get(roleId) ?? [];
    list.push(String(link.permission_id));
    granted.set(roleId, list);
  }
  return {
    roles: roles.map((role) => ({
      role_id: String(role.role_id),
      role_code: role.role_code,
      role_name: role.role_name,
      description: role.description,
      permission_ids: granted.get(String(role.role_id)) ?? [],
    })),
    permissions: permissions.map((permission) => ({
      permission_id: String(permission.permission_id),
      permission_code: permission.permission_code,
      permission_name: permission.permission_name,
    })),
  };
}

export async function replaceRolePermissions(
  roleId: string,
  permissionIds: string[],
) {
  const actor = await requirePermission("roles.manage");
  const id = parseId(roleId, "роль");
  if (!Array.isArray(permissionIds) || permissionIds.length > 500) {
    throw new Error("Некорректный список разрешений");
  }
  const uniqueIds = [...new Set(permissionIds)].map((item) =>
    parseId(item, "разрешение"),
  );
  const role = await prisma.roles.findUnique({
    where: { role_id: id },
    select: { role_code: true },
  });
  if (!role) throw new Error("Роль не найдена");
  const existing = await prisma.permissions.findMany({
    where: { permission_id: { in: uniqueIds } },
    select: { permission_id: true },
  });
  if (existing.length !== uniqueIds.length) throw new Error("Передан неизвестный идентификатор разрешения");

  const currentLinks = await prisma.role_permissions.findMany({
    where: { role_id: id },
    select: { permission_id: true },
  });
  const currentIds = currentLinks.map((item) => String(item.permission_id)).sort();
  const nextIds = uniqueIds.map(String).sort();
  if (currentIds.length === nextIds.length && currentIds.every((value, index) => value === nextIds[index])) {
    return { ok: true, unchanged: true };
  }

  await prisma.$transaction(async (tx) => {
    // Сериализуем изменения набора прав с созданием сессии этого role_id.
    await tx.$queryRaw`SELECT role_id FROM public.roles WHERE role_id = ${id} FOR UPDATE`;
    await tx.role_permissions.deleteMany({ where: { role_id: id } });
    if (uniqueIds.length) {
      await tx.role_permissions.createMany({
        data: uniqueIds.map((permission_id) => ({ role_id: id, permission_id })),
      });
    }
    await tx.audit_logs.create({
      data: {
        actor_user_id: actor.userId,
        action: "roles.permissions.replace",
        target_type: "role",
        target_id: String(id),
        details: { role_code: role.role_code, permission_ids: nextIds },
      },
    });
  });
  return { ok: true, unchanged: false };
}

export async function getAuditLogs(limit = 100) {
  await requirePermission("audit.read");
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.trunc(limit), 1), 200) : 100;
  const rows = await prisma.audit_logs.findMany({
    orderBy: { created_at: "desc" },
    take: safeLimit,
    include: { users: { select: { username: true } } },
  });
  return rows.map((row) => ({
    audit_id: String(row.audit_id),
    actor: row.users?.username ?? "Удалённый пользователь",
    action: row.action,
    target_type: row.target_type,
    target_id: row.target_id,
    details: row.details,
    created_at: row.created_at.toISOString(),
  }));
}
