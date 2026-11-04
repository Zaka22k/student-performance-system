import { requireSession } from "@/server/auth/session";
import { listAccountSessions } from "@/server/account";
import AccountPageView from "./AccountPageView";

const ROLE_LABELS: Record<string, string> = {
  admin: "Администратор",
  teacher: "Преподаватель",
  student: "Студент",
};

export default async function AccountPage() {
  const session = await requireSession();
  const sessions = await listAccountSessions(
    session.userId,
    session.sessionId,
  );

  return (
    <AccountPageView
      username={session.username}
      roleCode={session.roleCode}
      roleName={ROLE_LABELS[session.roleCode] ?? session.roleCode}
      currentSessionId={session.sessionId}
      initialSessions={sessions}
    />
  );
}
