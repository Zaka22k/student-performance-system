import { prisma } from "@/server/lib/prisma";

export interface AccountSessionRecord {
  session_id: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  is_current: boolean;
}

export async function listAccountSessions(
  userId: bigint,
  currentSessionId: string,
): Promise<AccountSessionRecord[]> {
  const rows = await prisma.sessions.findMany({
    where: {
      user_id: userId,
      expires_at: { gt: new Date() },
    },
    orderBy: [{ last_seen_at: "desc" }, { created_at: "desc" }],
    select: {
      session_id: true,
      created_at: true,
      last_seen_at: true,
      expires_at: true,
    },
  });

  return rows.map((row) => ({
    session_id: row.session_id,
    created_at: row.created_at.toISOString(),
    last_seen_at: row.last_seen_at.toISOString(),
    expires_at: row.expires_at.toISOString(),
    is_current: row.session_id === currentSessionId,
  }));
}
