import type { DataGridColumn } from "@ui-kit/components";
import type { SubjectStat } from "@/models";
import { formatAverage, formatPercent } from "../../format";
import styles from "./columns.module.css";

function getGradeTone(avg: number | null): string {
  if (avg === null) return styles.toneEmpty;
  if (avg >= 4.2) return styles.toneHigh;
  if (avg >= 3.5) return styles.toneMedium;
  return styles.toneLow;
}

function getPercentTone(rate: number | null): string {
  if (rate === null) return styles.toneEmpty;
  if (rate >= 75) return styles.toneHigh;
  if (rate >= 50) return styles.toneMedium;
  return styles.toneLow;
}

function renderGradeCount(count: number, toneClass: string) {
  if (!count) {
    return (
      <span className={`CaptionTextBlockStyle ${styles.gradeZero}`}>0</span>
    );
  }
  return (
    <span className={`CaptionTextBlockStyle ${styles.gradePill} ${toneClass}`}>
      {count}
    </span>
  );
}

export const subjectStatColumns: DataGridColumn<SubjectStat>[] = [
  {
    id: "subject",
    header: "Дисциплина",
    width: 300,
    cell: (s) => (
      <div
        className={styles.subjectCell}
        title={`${s.subject_code} — ${s.subject_name}`}
      >
        <span className={`CaptionTextBlockStyle ${styles.codeBadge}`}>
          {s.subject_code}
        </span>
        <span
          className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.subjectName}`}
        >
          {s.subject_name}
        </span>
      </div>
    ),
  },
  {
    id: "records",
    header: "Результатов",
    width: 130,
    align: "end",
    cell: (s) => (
      <span className={`CaptionTextBlockStyle ${styles.countTag}`}>
        {s.records}
      </span>
    ),
  },
  {
    id: "average",
    header: "Средняя оценка",
    width: 150,
    align: "end",
    cell: (s) =>
      s.average_grade === null ? (
        <span className={`BodyTextBlockStyle ${styles.toneEmpty}`}>
          {formatAverage(s.average_grade)}
        </span>
      ) : (
        <span
          className={`CaptionTextBlockStyle ${styles.metricPill} ${getGradeTone(
            s.average_grade,
          )}`}
        >
          {formatAverage(s.average_grade)}
        </span>
      ),
  },
  {
    id: "g2",
    header: "«2»",
    width: 70,
    align: "end",
    cell: (s) => renderGradeCount(s.grade_2, styles.grade2),
  },
  {
    id: "g3",
    header: "«3»",
    width: 70,
    align: "end",
    cell: (s) => renderGradeCount(s.grade_3, styles.grade3),
  },
  {
    id: "g4",
    header: "«4»",
    width: 70,
    align: "end",
    cell: (s) => renderGradeCount(s.grade_4, styles.grade4),
  },
  {
    id: "g5",
    header: "«5»",
    width: 70,
    align: "end",
    cell: (s) => renderGradeCount(s.grade_5, styles.grade5),
  },
  {
    id: "success",
    header: "Успеваемость",
    width: 150,
    align: "end",
    cell: (s) =>
      s.success_rate === null ? (
        <span className={`BodyTextBlockStyle ${styles.toneEmpty}`}>
          {formatPercent(s.success_rate)}
        </span>
      ) : (
        <span
          className={`CaptionTextBlockStyle ${styles.metricPill} ${getPercentTone(
            s.success_rate,
          )}`}
        >
          {formatPercent(s.success_rate)}
        </span>
      ),
  },
  {
    id: "quality",
    header: "Качество",
    align: "end",
    cell: (s) =>
      s.quality_rate === null ? (
        <span className={`BodyTextBlockStyle ${styles.toneEmpty}`}>
          {formatPercent(s.quality_rate)}
        </span>
      ) : (
        <span
          className={`CaptionTextBlockStyle ${styles.metricPill} ${getPercentTone(
            s.quality_rate,
          )}`}
        >
          {formatPercent(s.quality_rate)}
        </span>
      ),
  },
];
