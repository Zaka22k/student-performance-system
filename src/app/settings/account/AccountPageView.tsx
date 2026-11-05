"use client";

import { createElement as h, useMemo } from "react";
import {
  Button,
  DataGrid,
  Page,
  type DataGridColumn,
} from "@ui-kit/components";
import { LockIcon, LogOutIcon } from "@/icons";
import AccountHero from "./AccountHero";
import { useAccountPage } from "./useAccountPage";
import type { AccountSessionRecord } from "@/server/account";
import styles from "./AccountPage.module.css";

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
        cell: (session) =>
          h(
            "div",
            { className: styles.sessionIdentity },
            h(
              "strong",
              null,
              session.is_current ? "Это устройство" : "Другое устройство",
            ),
            h("span", null, `${session.session_id.slice(0, 8)}…`),
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

  return h(
    Page,
    { title: "Учётная запись", hero: h(AccountHero) },
    h(
      "div",
      { className: styles.accountLayout },
      h(
        "section",
        { className: styles.accountCard },
        h(
          "div",
          { className: styles.accountAvatar, "aria-hidden": "true" },
          username.slice(0, 2).toLocaleUpperCase("ru"),
        ),
        h(
          "div",
          { className: styles.accountIdentity },
          h(
            "h2",
            { className: "BodyTextBlockStyle BodyStrongTextBlockStyle" },
            username,
          ),
          h(
            "p",
            { className: "CaptionTextBlockStyle" },
            `${roleName} · `,
            h("span", { className: styles.accountRoleCode }, roleCode),
          ),
        ),
        h(
          Button,
          { appearance: "destructive", onClick: page.signOut },
          "Выйти из системы",
        ),
      ),
      h(
        "section",
        { className: styles.accountSessions },
        h(
          "div",
          { className: styles.accountSectionHeader },
          h(
            "div",
            null,
            h("h2", { className: "SubtitleTextBlockStyle" }, "Активные сессии"),
            h(
              "p",
              { className: "CaptionTextBlockStyle" },
              "Все действующие входы в вашу учётную запись. Отозванные сессии немедленно теряют доступ к системе.",
            ),
          ),
          h("span", { className: styles.sessionCount }, page.sessions.length),
        ),
        h(DataGrid<AccountSessionRecord>, {
          "aria-label": "Активные сессии учётной записи",
          rows: page.sessions,
          columns,
          getRowId: (session) => session.session_id,
          emptyContent: "Активных сессий нет",
          rowMenu: ({ row }) => [
            {
              id: "revoke-session",
              label: row.is_current ? "Выйти" : "Отозвать сессию",
              icon: row.is_current ? h(LogOutIcon) : h(LockIcon),
              danger: true,
              onSelect: () => page.revokeSession(row),
            },
          ],
        }),
      ),
    ),
  );
}
