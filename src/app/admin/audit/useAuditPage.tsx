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
  "auth.session.revoke": "Отзыв сессии",
  "auth.login_failed": "Неудачная попытка входа",
  "users.bootstrap_admin": "Создание администратора",
  "users.create": "Создание пользователя",
  "users.delete": "Удаление пользователя",
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
      : (JSON.stringify(details) ?? "—");
  } catch {
    return "Детали недоступны";
  }
}

export type AuditFilter = "all" | "auth" | "users" | "roles";

export const AUDIT_FILTERS: { value: AuditFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "auth", label: "Cессии" },
  { value: "users", label: "Пользователи" },
  { value: "roles", label: "Роли" },
];

export type AuditTone = "normal" | "warn" | "danger";

const DANGER_ACTIONS = new Set([
  "users.delete",
  "users.deactivate",
  "users.password.reset",
  "roles.delete",
]);

export function auditTone(action: string): AuditTone {
  if (action === "auth.login_failed") return "warn";
  if (DANGER_ACTIONS.has(action)) return "danger";
  return "normal";
}

const matchesFilter = (row: AuditEntry, filter: AuditFilter) =>
  filter === "all" || row.action.startsWith(`${filter}.`);

export function useAuditPage(initialRows: AuditEntry[]) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AuditFilter>("all");

  const counts = useMemo(() => {
    const result: Record<AuditFilter, number> = {
      all: initialRows.length,
      auth: 0,
      users: 0,
      roles: 0,
    };
    for (const row of initialRows) {
      for (const f of ["auth", "users", "roles"] as const) {
        if (matchesFilter(row, f)) result[f] += 1;
      }
    }
    return result;
  }, [initialRows]);

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru");
    const byFilter = initialRows.filter((row) => matchesFilter(row, filter));
    if (!normalizedQuery) return byFilter;

    return byFilter.filter((row) =>
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
  }, [initialRows, query, filter]);

  return {
    query,
    setQuery,
    filter,
    setFilter,
    counts,
    rows,
    total: initialRows.length,
  };
}
