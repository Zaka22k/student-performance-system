"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DataGrid,
  Page,
  SearchField,
  type DataGridColumn,
  SegmentedControl,
} from "@ui-kit/components";
import {
  ACTION_LABELS,
  AUDIT_FILTERS,
  auditTone,
  detailsText,
  useAuditPage,
  type AuditEntry,
} from "./useAuditPage";
import styles from "../Admin.module.css";

interface AuditPageViewProps {
  initialRows: AuditEntry[];
}

export default function AuditPageView({ initialRows }: AuditPageViewProps) {
  const page = useAuditPage(initialRows);
  const [activeFilter, setActiveFilter] = useState(page.filter);

  useEffect(() => {
    page.setFilter(activeFilter);
  }, [activeFilter, page]);

  const columns = useMemo<DataGridColumn<AuditEntry>[]>(
    () => [
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
              {new Date(row.created_at).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ),
      },
      {
        id: "actor",
        header: "Пользователь",
        width: 150,
        cell: (row) => row.actor,
      },
      {
        id: "action",
        header: "Событие",
        width: 250,
        cell: (row) => (
          <div className={styles.eventCell}>
            <span
              className={styles.mark}
              data-tone={auditTone(row.action)}
              aria-hidden="true"
            />
            <div className={styles.cellMain}>
              <span className={styles.cellTitle}>
                {ACTION_LABELS[row.action] ?? row.action}
              </span>
              <span className={styles.cellMeta}>{row.action}</span>
            </div>
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
          <span
            className={styles.auditDetails}
            title={detailsText(row.details)}
          >
            {detailsText(row.details)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <Page
      title="Журнал действий"
      toolbar={{
        trailing: (
          <SearchField
            className={styles.toolbarSearch}
            placeholder="Поиск событий"
            aria-label="Поиск по журналу действий"
            value={page.query}
            onChange={(event) => page.setQuery(event.target.value)}
          />
        ),
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          marginTop: "24px",
        }}
      >
        <SegmentedControl
          value={activeFilter}
          onValueChange={setActiveFilter}
          items={AUDIT_FILTERS}
          aria-label="Тип событий"
        />
        <DataGrid
          aria-label="Журнал аудита"
          rows={page.rows}
          columns={columns}
          getRowId={(row) => row.audit_id}
          resetKey={`${page.query}|${page.filter}`}
          emptyContent="События не найдены. Измените запрос или выберите другой тип событий."
        />
      </div>
    </Page>
  );
}
