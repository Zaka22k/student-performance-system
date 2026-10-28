"use client";

import { Page, DataGrid, ComboBox, SearchField } from "@ui-kit/components";
import { semesterLabel } from "@/utils";
import type { Group, ScheduleItem, Semester } from "@/models";
import { scheduleColumns, scheduleRowId } from "./_columns";
import { useSchedulePage } from "./useSchedulePage";
import styles from "./SchedulePage.module.css";

interface SchedulePageViewProps {
  groups: Group[];
  semesters: Semester[];
  initialSemesterId: string;
  initialRows: ScheduleItem[];
}

export default function SchedulePageView({
  groups,
  semesters,
  initialSemesterId,
  initialRows,
}: SchedulePageViewProps) {
  const p = useSchedulePage({
    groups,
    semesters,
    initialSemesterId,
    initialRows,
  });

  return (
    <Page
      title="Расписание экзаменов и зачётов"
      toolbar={{
        trailing: (
          <SearchField
            placeholder="Поиск по расписанию"
            value={p.query}
            onChange={(e) => p.setQuery(e.target.value)}
          />
        ),
      }}
    >
      <div className={styles.layout}>
        <div className={styles.params}>
          <ComboBox
            className={styles.param}
            label="Семестр"
            options={p.semesters}
            getOptionValue={(s) => String(s.semester_id)}
            getOptionLabel={(s) => semesterLabel(s)}
            value={p.semesterId}
            placeholder="Выберите семестр"
            onChange={(value) => p.setSemesterId(value)}
          />
          <ComboBox
            className={styles.param}
            label="Группа"
            options={p.groups}
            getOptionValue={(g) => String(g.group_id)}
            getOptionLabel={(g) => g.group_code}
            value={p.groupId}
            placeholder="Все группы"
            onChange={(value) => p.setGroupId(value)}
          />
        </div>
        <div className={styles.grid}>
          <DataGrid
            aria-label="Расписание экзаменов и зачётов"
            rows={p.rows}
            columns={scheduleColumns}
            getRowId={scheduleRowId}
            resetKey={`${p.semesterId}|${p.groupId}|${p.query}`}
            emptyContent={
              p.loadFailed
                ? "Не удалось загрузить расписание"
                : "Экзаменов и зачётов не найдено"
            }
          />
        </div>
      </div>
    </Page>
  );
}
