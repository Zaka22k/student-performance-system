"use client";

import { useMemo, useState } from "react";

export type AuditEntry = {
  audit_id: string;
  actor: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: unknown;
  created_at: string;
};

export const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Вход в систему",
  "auth.logout": "Выход из системы",
  "auth.login_failed": "Неудачная попытка входа",
  "users.bootstrap_admin": "Создание администратора",
  "users.create": "Создание пользователя",
  "users.role.change": "Изменение роли",
  "users.activate": "Активация учётной записи",
  "users.deactivate": "Блокировка учётной записи",
  "users.password.reset": "Сброс пароля",
  "roles.create": "Создание роли",
  "roles.delete": "Удаление роли",
  "roles.permissions.replace": "Изменение разрешений",
};

export function detailsText(details: unknown): string {
  if (details === null || details === undefined) return "—";
  try {
    return typeof details === "string"
      ? details
      : JSON.stringify(details) ?? "—";
  } catch {
    return "Детали недоступны";
  }
}

export function useAuditPage(initialRows: AuditEntry[]) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru");
    if (!normalizedQuery) return initialRows;

    return initialRows.filter((row) =>
      [
        row.actor,
        row.action,
        ACTION_LABELS[row.action] ?? "",
        row.target_type ?? "",
        row.target_id ?? "",
        detailsText(row.details),
      ]
        .join(" ")
        .toLocaleLowerCase("ru")
        .includes(normalizedQuery),
    );
  }, [initialRows, query]);

  return { query, setQuery, rows };
}
