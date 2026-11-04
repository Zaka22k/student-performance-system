"use client";

import { useMemo } from "react";
import {
  Button,
  DataGrid,
  Page,
  type DataGridColumn,
} from "@ui-kit/components";
import { LockIcon, LogOutIcon } from "@/icons";
import { useAccountPage } from "./useAccountPage";
import type { AccountSessionRecord } from "@/server/account";
import styles from "../SettingsPage.module.css";

interface AccountPageViewProps {
  username: string;
  roleCode: string;
  roleName: string;
  currentSessionId: string;
  initialSessions: AccountSessionRecord[];
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AccountPageView({
  username,
  roleCode,
  roleName,
  currentSessionId,
  initialSessions,
}: AccountPageViewProps) {
  const page = useAccountPage(initialSessions, currentSessionId);

  const columns = useMemo<DataGridColumn<AccountSessionRecord>[]>(
    () => [
      {
        id: "session",
        header: "Сессия",
        width: 190,
        cell: (session) => (
          <div className={styles.sessionIdentity}>
            <strong>
              {session.is_current ? "Это устройство" : "Другое устройство"}
            </strong>
            <span>{session.session_id.slice(0, 8)}…</span>
          </div>
        ),
      },
      {
        id: "created",
        header: "Создана",
        width: 190,
        cell: (session) => formatDate(session.created_at),
      },
      {
        id: "last-seen",
        header: "Последняя активность",
        width: 210,
        cell: (session) => formatDate(session.last_seen_at),
      },
      {
        id: "expires",
        header: "Истекает",
        width: 190,
        cell: (session) => formatDate(session.expires_at),
      },
    ],
    [],
  );

  return (
    <Page title="Учётная запись">
      <div className={styles.accountLayout}>
        <section className={styles.accountCard}>
          <div className={styles.accountAvatar} aria-hidden="true">
            {username.slice(0, 2).toLocaleUpperCase("ru")}
          </div>
          <div className={styles.accountIdentity}>
            <h2 className="BodyTextBlockStyle BodyStrongTextBlockStyle">
              {username}
            </h2>
            <p className="CaptionTextBlockStyle">
              {roleName} ·{" "}
              <span className={styles.accountRoleCode}>{roleCode}</span>
            </p>
          </div>
          <Button appearance="destructive" onClick={page.signOut}>
            Выйти из системы
          </Button>
        </section>

        <section className={styles.accountSessions}>
          <div className={styles.accountSectionHeader}>
            <div>
              <h2 className="SubtitleTextBlockStyle">Активные сессии</h2>
              <p className="CaptionTextBlockStyle">
                Все действующие входы в вашу учётную запись. Отозванные сессии
                немедленно теряют доступ к системе.
              </p>
            </div>
            <span className={styles.sessionCount}>{page.sessions.length}</span>
          </div>

          <DataGrid
            aria-label="Активные сессии учётной записи"
            rows={page.sessions}
            columns={columns}
            getRowId={(session) => session.session_id}
            emptyContent="Активных сессий нет"
            rowMenu={({ row }) => [
              {
                id: "revoke-session",
                label: row.is_current ? "Выйти" : "Отозвать сессию",
                icon: row.is_current ? <LogOutIcon /> : <LockIcon />,
                danger: true,
                onSelect: () => page.revokeSession(row),
              },
            ]}
          />
        </section>
      </div>
    </Page>
  );
}
