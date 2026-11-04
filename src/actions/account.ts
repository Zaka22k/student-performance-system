"use server";

import { prisma } from "@/server/lib/prisma";
import {
  destroyCurrentSession,
  requireSession,
} from "@/server/auth/session";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function revokeAccountSession(sessionId: string) {
  const actor = await requireSession();
  if (typeof sessionId !== "string" || !UUID_PATTERN.test(sessionId)) {
    throw new Error("Некорректный идентификатор сессии");
  }

  const isCurrentSession = actor.sessionId === sessionId;

  await prisma.$transaction(async (tx) => {
    const deleted = await tx.sessions.deleteMany({
      where: {
        session_id: sessionId,
        user_id: actor.userId,
      },
    });

    if (deleted.count === 0) {
      throw new Error("Сессия не найдена или уже завершена");
    }

    await tx.audit_logs.create({
      data: {
        actor_user_id: actor.userId,
        action: "auth.session.revoke",
        target_type: "session",
        target_id: sessionId,
        details: { current_session: isCurrentSession },
      },
    });
  });

  if (isCurrentSession) {
    // Помимо удаления записи очищаем cookie текущего браузера.
    await destroyCurrentSession();
  }

  return { currentSessionRevoked: isCurrentSession };
}
