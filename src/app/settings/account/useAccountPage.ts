"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useModal, useToast } from "@ui-kit/components";
import { logout } from "@/actions/auth";
import { revokeAccountSession } from "@/actions/account";
import { getErrorMessage } from "@/utils";
import type { AccountSessionRecord } from "@/server/account";

export function useAccountPage(
  initialSessions: AccountSessionRecord[],
  currentSessionId: string,
) {
  const router = useRouter();
  const { openModal } = useModal();
  const toast = useToast();
  const [sessions, setSessions] = useState(initialSessions);

  const revokeSession = (session: AccountSessionRecord) => {
    const isCurrent = session.session_id === currentSessionId;

    openModal({
      title: isCurrent ? "Завершить текущую сессию" : "Отозвать сессию",
      actionText: isCurrent ? "Выйти" : "Отозвать",
      actionAppearance: "destructive",
      errorMessage: getErrorMessage,
      content: (
        <p className="BodyTextBlockStyle">
          {isCurrent
            ? "Текущая сессия будет завершена, и приложение вернёт вас на страницу входа."
            : "Выбранная сессия будет отозвана. Устройство больше не сможет пользоваться этой учётной записью."}
        </p>
      ),
      onAction: async () => {
        const result = await revokeAccountSession(session.session_id);
        setSessions((current) =>
          current.filter((item) => item.session_id !== session.session_id),
        );

        if (result.currentSessionRevoked) {
          toast.success("Текущая сессия завершена");
          router.replace("/login");
          router.refresh();
          return;
        }

        toast.success("Сессия отозвана");
        router.refresh();
      },
    });
  };

  const signOut = async () => {
    await logout();
    router.replace("/login");
    router.refresh();
  };

  return {
    sessions,
    revokeSession,
    signOut,
  };
}
