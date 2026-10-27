import type { DataGridColumn } from "@/components";
import type { GroupStat } from "@/models";
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

export const groupStatColumns: DataGridColumn<GroupStat>[] = [
  {
    id: "group",
    header: "Группа",
    width: 140,
    cell: (g) => (
      <span
        className={`CaptionTextBlockStyle ${styles.groupBadge}`}
        title={g.group_name}
      >
        {g.group_code}
      </span>
    ),
  },
  {
    id: "students",
    header: "Студентов",
    width: 130,
    align: "end",
    cell: (g) => (
      <span className={`CaptionTextBlockStyle ${styles.countTag}`}>
        {g.students_count}
      </span>
    ),
  },
  {
    id: "records",
    header: "Результатов",
    width: 140,
    align: "end",
    cell: (g) => (
      <span className={`CaptionTextBlockStyle ${styles.countTag}`}>
        {g.records}
      </span>
    ),
  },
  {
    id: "average",
    header: "Средняя оценка",
    width: 160,
    align: "end",
    cell: (g) =>
      g.average_grade === null ? (
        <span className={`BodyTextBlockStyle ${styles.toneEmpty}`}>
          {formatAverage(g.average_grade)}
        </span>
      ) : (
        <span
          className={`CaptionTextBlockStyle ${styles.metricPill} ${getGradeTone(
            g.average_grade,
          )}`}
        >
          {formatAverage(g.average_grade)}
        </span>
      ),
  },
  {
    id: "success",
    header: "Успеваемость",
    width: 150,
    align: "end",
    cell: (g) =>
      g.success_rate === null ? (
        <span className={`BodyTextBlockStyle ${styles.toneEmpty}`}>
          {formatPercent(g.success_rate)}
        </span>
      ) : (
        <span
          className={`CaptionTextBlockStyle ${styles.metricPill} ${getPercentTone(
            g.success_rate,
          )}`}
        >
          {formatPercent(g.success_rate)}
        </span>
      ),
  },
  {
    id: "quality",
    header: "Качество",
    align: "end",
    cell: (g) =>
      g.quality_rate === null ? (
        <span className={`BodyTextBlockStyle ${styles.toneEmpty}`}>
          {formatPercent(g.quality_rate)}
        </span>
      ) : (
        <span
          className={`CaptionTextBlockStyle ${styles.metricPill} ${getPercentTone(
            g.quality_rate,
          )}`}
        >
          {formatPercent(g.quality_rate)}
        </span>
      ),
  },
];
