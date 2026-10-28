"use client";

import { Page, DataGrid, ComboBox } from "@ui-kit/components";
import { BarChart } from "../_barChart";
import { semesterLabel } from "@/utils";
import type { Group, GradeBucket, Semester, SubjectStat } from "@/models";
import { subjectStatColumns } from "./_columns";
import { useSubjectsAnalyticsPage } from "./useSubjectsAnalyticsPage";
import styles from "../Analytics.module.css";

interface SubjectsAnalyticsPageViewProps {
  semesters: Semester[];
  groups: Group[];
  initialRows: SubjectStat[];
  initialDistribution: GradeBucket[];
}

export default function SubjectsAnalyticsPageView({
  semesters,
  groups,
  initialRows,
  initialDistribution,
}: SubjectsAnalyticsPageViewProps) {
  const p = useSubjectsAnalyticsPage({
    semesters,
    groups,
    initialRows,
    initialDistribution,
  });

  const emptyText = p.loadFailed
    ? "Не удалось загрузить данные"
    : "Результатов нет";
  const hasGrades = p.distribution.some((d) => d.count > 0);

  return (
    <Page title="Успеваемость по дисциплинам">
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

        <section className={styles.card}>
          <h2 className={`BodyStrongTextBlockStyle ${styles.cardTitle}`}>
            Распределение оценок
          </h2>
          <BarChart
            aria-label="Распределение оценок"
            items={
              hasGrades
                ? p.distribution.map((d) => ({
                    label: `Оценка ${d.grade}`,
                    value: d.count,
                  }))
                : []
            }
            emptyContent={emptyText}
          />
          <p className={`CaptionTextBlockStyle ${styles.hint}`}>
            Считаются итоговые результаты (последняя попытка). Зачёты в
            распределение не входят.
          </p>
        </section>

        <div className={styles.grid}>
          <DataGrid
            aria-label="Успеваемость по дисциплинам"
            rows={p.rows}
            columns={subjectStatColumns}
            getRowId={(s) => s.subject_id}
            resetKey={`${p.semesterId}|${p.groupId}`}
            emptyContent={emptyText}
          />
        </div>
      </div>
    </Page>
  );
}
