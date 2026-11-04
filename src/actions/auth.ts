"use server";

import { prisma } from "@/server/lib/prisma";
import {
  createSession,
  destroyCurrentSession,
  verifyPassword,
} from "@/server/auth/session";

export interface LoginResult {
  ok: boolean;
  message?: string;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResult> {
  const normalizedUsername = String(username ?? "").trim();
  if (!normalizedUsername || normalizedUsername.length > 80 || !password) {
    return { ok: false, message: "Введите логин и пароль" };
  }

  const user = await prisma.users.findUnique({
    where: { username: normalizedUsername },
    select: { user_id: true, password_hash: true, is_active: true },
  });

  if (
    !user ||
    !user.is_active ||
    !(await verifyPassword(password, user.password_hash))
  ) {
    return { ok: false, message: "Неверный логин или пароль" };
  }

  await createSession(user.user_id);
  await prisma.audit_logs.create({
    data: {
      actor_user_id: user.user_id,
      action: "auth.login",
      target_type: "session",
      details: { username: normalizedUsername },
    },
  });

  return { ok: true };
}

export async function logout(): Promise<void> {
  await destroyCurrentSession();
}
