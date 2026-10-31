"use client";

import { Page, DataGrid, ComboBox } from "@ui-kit/components";
import { semesterLabel } from "@/utils";
import type { GroupStat, Semester } from "@/models";
import { formatAverage } from "../format";
import { groupStatColumns } from "./_columns";
import { useGroupsAnalyticsPage } from "./useGroupsAnalyticsPage";
import { BarChart } from "../_barChart";
import styles from "../Analytics.module.css";

interface GroupsAnalyticsPageViewProps {
  semesters: Semester[];
  initialRows: GroupStat[];
}

export default function GroupsAnalyticsPageView({
  semesters,
  initialRows,
}: GroupsAnalyticsPageViewProps) {
  const p = useGroupsAnalyticsPage(semesters, initialRows);

  return (
    <Page title="Успеваемость по группам">
      <div className={styles.layout}>
        <div className={styles.params}>
          <ComboBox
            className={styles.param}
            label="Семестр"
            options={p.semesters}
            getOptionValue={(s) => String(s.semester_id)}
            getOptionLabel={(s) => semesterLabel(s)}
            value={p.semesterId}
            placeholder="Все семестры"
            onChange={(value) => p.setSemesterId(value)}
          />
        </div>

        <section className={styles.card}>
          <h2 className={`BodyStrongTextBlockStyle ${styles.cardTitle}`}>
            Средняя оценка по группам
          </h2>
          <BarChart
            aria-label="Средняя оценка по группам"
            items={p.rows.map((g) => ({
              label: g.group_code,
              value: g.average_grade,
            }))}
            max={5}
            formatValue={formatAverage}
            emptyContent={
              p.loadFailed ? "Не удалось загрузить данные" : "Групп нет"
            }
          />
          <p className={`CaptionTextBlockStyle ${styles.hint}`}>
            Считаются итоговые результаты (последняя попытка). Зачёты в среднюю
            оценку не входят.
          </p>
        </section>

        <div className={styles.grid}>
          <DataGrid
            aria-label="Успеваемость по группам"
            rows={p.rows}
            height={"max-content"}
            columns={groupStatColumns}
            getRowId={(g) => g.group_id}
            resetKey={p.semesterId}
            emptyContent={
              p.loadFailed ? "Не удалось загрузить данные" : "Групп нет"
            }
          />
        </div>
      </div>
    </Page>
  );
}
