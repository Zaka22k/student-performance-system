"use client";

import { useMemo, useState } from "react";
import {
  DataGrid,
  Page,
  SearchField,
  type DataGridColumn,
} from "@ui-kit/components";
import styles from "../Admin.module.css";

type AuditEntry = {
  audit_id: string;
  actor: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: unknown;
  created_at: string;
};

const ACTION_LABELS: Record<string, string> = {
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

function detailsText(details: unknown): string {
  if (details === null || details === undefined) return "—";
  try {
    return typeof details === "string" ? details : JSON.stringify(details);
  } catch {
    return "Детали недоступны";
  }
}

export default function AuditPageView({
  initialRows,
}: {
  initialRows: AuditEntry[];
}) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("ru");
    if (!q) return initialRows;
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
        .includes(q),
    );
  }, [initialRows, query]);

  const failedCount = initialRows.filter((row) => row.action === "auth.login_failed").length;
  const accessChanges = initialRows.filter((row) =>
    row.action.startsWith("users.") || row.action.startsWith("roles."),
  ).length;
  const uniqueActors = new Set(initialRows.map((row) => row.actor)).size;

  const columns = useMemo<DataGridColumn<AuditEntry>[]>(() => [
    {
      id: "date",
      header: "Дата и время",
      width: 180,
      cell: (row) => (
        <div className={styles.cellMain}>
          <span className={styles.cellTitle}>
            {new Date(row.created_at).toLocaleDateString("ru-RU")}
          </span>
          <span className={styles.cellMeta}>
            {new Date(row.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      ),
    },
    {
      id: "actor",
      header: "Пользователь",
      width: 190,
      cell: (row) => row.actor,
    },
    {
      id: "action",
      header: "Событие",
      width: 230,
      cell: (row) => (
        <div className={styles.cellMain}>
          <span className={styles.cellTitle}>{ACTION_LABELS[row.action] ?? row.action}</span>
          <span className={styles.cellMeta}>{row.action}</span>
        </div>
      ),
    },
    {
      id: "target",
      header: "Объект",
      width: 175,
      cell: (row) => (
        <div className={styles.cellMain}>
          <span>{row.target_type ?? "—"}</span>
          <span className={styles.cellMeta}>{row.target_id ?? ""}</span>
        </div>
      ),
    },
    {
      id: "details",
      header: "Подробности",
      width: 320,
      cell: (row) => (
        <span className={styles.auditDetails} title={detailsText(row.details)}>
          {detailsText(row.details)}
        </span>
      ),
    },
  ], []);

  return (
    <Page
      title="Журнал действий"
      toolbar={{
        trailing: (
          <SearchField
            className={styles.toolbarSearch}
            width="min(32vw, 340px)"
            placeholder="Поиск событий"
            aria-label="Поиск по журналу действий"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        ),
      }}
    >
      <div className={styles.content}>
        <div className={styles.intro}>
          <div className={styles.introCopy}>
            <span className={styles.eyebrow}>Аудит безопасности</span>
            <p className={styles.description}>
              История входов, изменений пользователей, ролей и разрешений. В таблице показаны последние события из журнала.
            </p>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Событий загружено</span>
            <strong className={styles.statValue}>{initialRows.length}</strong>
            <span className={styles.statHint}>Последние записи аудита</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Неудачные входы</span>
            <strong className={styles.statValue}>{failedCount}</strong>
            <span className={styles.statHint}>Попытки с неверными данными</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Изменения доступа</span>
            <strong className={styles.statValue}>{accessChanges}</strong>
            <span className={styles.statHint}>Операции над пользователями и ролями</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Участников</span>
            <strong className={styles.statValue}>{uniqueActors}</strong>
            <span className={styles.statHint}>Уникальные акторы в выборке</span>
          </div>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>События системы</h2>
              <p className={styles.panelDescription}>
                Найдено {rows.length} из {initialRows.length}
              </p>
            </div>
          </div>
          <DataGrid
            striped
            aria-label="Журнал аудита"
            rows={rows}
            columns={columns}
            getRowId={(row) => row.audit_id}
            resetKey={query}
            emptyContent={
              <div className={styles.emptyState}>
                <strong>События не найдены</strong>
                <span>Попробуй изменить поисковый запрос.</span>
              </div>
            }
          />
        </section>
      </div>
    </Page>
  );
}
