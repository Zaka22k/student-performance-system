import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { prisma } from "@/server/lib/prisma";

const scryptAsync = promisify(scrypt);
export const SESSION_COOKIE = "app-session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_COST = 16_384;

export interface SessionContext {
  sessionId: string;
  userId: bigint;
  username: string;
  roleCode: string;
  permissions: ReadonlySet<string>;
  studentId: bigint | null;
  teacherId: bigint | null;
}

export class AuthenticationError extends Error {
  readonly statusCode = 401;
  constructor(message = "Необходима авторизация") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  readonly statusCode = 403;
  constructor(message = "Недостаточно прав для выполнения операции") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64, {
    N: PASSWORD_COST,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  })) as Buffer;
  return `scrypt$${PASSWORD_COST}$8$1$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [algorithm, cost, blockSize, parallel, salt, expectedHex] = stored.split("$");
  if (
    algorithm !== "scrypt" ||
    cost !== String(PASSWORD_COST) ||
    blockSize !== "8" ||
    parallel !== "1" ||
    !/^[a-f0-9]{32}$/.test(salt ?? "") ||
    !/^[a-f0-9]{128}$/.test(expectedHex ?? "")
  ) return false;

  try {
    const expected = Buffer.from(expectedHex, "hex");
    const actual = (await scryptAsync(password, salt, expected.length, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallel),
      maxmem: 64 * 1024 * 1024,
    })) as Buffer;
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function createSession(userId: bigint): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await prisma.$transaction(async (tx) => {
    // Блокируем строку учётной записи, чтобы смена роли/активности/пароля
    // не могла вклиниться между чтением пользователя и созданием сессии.
    const users = await tx.$queryRaw<Array<{
      user_id: bigint;
      role_id: bigint;
      student_id: bigint | null;
      teacher_id: bigint | null;
      is_active: boolean;
    }>>`SELECT user_id, role_id, student_id, teacher_id, is_active
         FROM public.users
        WHERE user_id = ${userId}
        FOR UPDATE`;
    const user = users[0];
    if (!user || !user.is_active) {
      throw new AuthenticationError("Учётная запись недоступна");
    }

    const roles = await tx.$queryRaw<Array<{ role_code: string }>>`SELECT role_code
         FROM public.roles
        WHERE role_id = ${user.role_id}
        FOR UPDATE`;
    const role = roles[0];
    if (!role) throw new AuthenticationError("Роль учётной записи не найдена");

    const permissionRows = await tx.$queryRaw<Array<{ permission_code: string }>>`SELECT p.permission_code
         FROM public.role_permissions rp
         JOIN public.permissions p ON p.permission_id = rp.permission_id
        WHERE rp.role_id = ${user.role_id}
        ORDER BY p.permission_code
        FOR SHARE OF rp`;

    await tx.sessions.create({
      data: {
        token_hash: hashSessionToken(token),
        user_id: user.user_id,
        role_code: role.role_code,
        permissions: permissionRows.map((item) => item.permission_code),
        student_id: user.student_id,
        teacher_id: user.teacher_id,
        expires_at: expiresAt,
      },
    });
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentSession(): Promise<SessionContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 128) return null;

  const session = await prisma.sessions.findUnique({
    where: { token_hash: hashSessionToken(token) },
    include: {
      users: {
        select: { user_id: true, username: true, is_active: true },
      },
    },
  });

  if (!session) return null;
  if (!session.users.is_active || session.expires_at.getTime() <= Date.now()) {
    await prisma.sessions.deleteMany({
      where: { session_id: session.session_id },
    });
    return null;
  }

  if (Date.now() - session.last_seen_at.getTime() > 5 * 60 * 1000) {
    const heartbeat = await prisma.sessions.updateMany({
      where: { session_id: session.session_id },
      data: { last_seen_at: new Date() },
    });
    if (heartbeat.count === 0) return null;
  }

  return {
    sessionId: session.session_id,
    userId: session.user_id,
    username: session.users.username,
    roleCode: session.role_code,
    permissions: new Set(session.permissions),
    studentId: session.student_id,
    teacherId: session.teacher_id,
  };
}

export async function requireSession(): Promise<SessionContext> {
  const session = await getCurrentSession();
  if (!session) throw new AuthenticationError();
  return session;
}

export async function requirePermission(
  permission: string,
): Promise<SessionContext> {
  const session = await requireSession();
  if (!session.permissions.has(permission)) throw new AuthorizationError();
  return session;
}

export async function requireAnyPermission(
  permissions: readonly string[],
): Promise<SessionContext> {
  const session = await requireSession();
  if (!permissions.some((permission) => session.permissions.has(permission))) {
    throw new AuthorizationError();
  }
  return session;
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.sessions.deleteMany({
      where: { token_hash: hashSessionToken(token) },
    });
  }
  cookieStore.delete(SESSION_COOKIE);
}
