import type { DataGridColumn } from "@ui-kit/components";
import type { SubjectStat } from "@/models";
import { formatAverage, formatPercent } from "../../format";
import styles from "./columns.module.css";

function GradeCount({ count, fail }: { count: number; fail?: boolean }) {
  const className = !count
    ? styles.gradeZero
    : fail
      ? styles.gradeFail
      : styles.gradeCount;
  return (
    <span className={`BodyTextBlockStyle ${className}`}>{count || 0}</span>
  );
}

export const subjectStatColumns: DataGridColumn<SubjectStat>[] = [
  {
    id: "subject",
    header: "Дисциплина",
    width: 340,
    cell: (s) => (
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.subjectName}`}
      >
        {s.subject_name}
      </span>
    ),
  },
  {
    id: "records",
    header: "Результатов",
    width: 130,
    align: "end",
    cell: (s) => (
      <span className={`BodyTextBlockStyle ${styles.count}`}>{s.records}</span>
    ),
  },
  {
    id: "average",
    header: "Средняя оценка",
    width: 160,
    align: "end",
    cell: (s) => (
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.metricValue}`}
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
    cell: (s) => <GradeCount count={s.grade_2} fail />,
  },
  {
    id: "g3",
    header: "«3»",
    width: 70,
    align: "end",
    cell: (s) => <GradeCount count={s.grade_3} />,
  },
  {
    id: "g4",
    header: "«4»",
    width: 70,
    align: "end",
    cell: (s) => <GradeCount count={s.grade_4} />,
  },
  {
    id: "g5",
    header: "«5»",
    width: 70,
    align: "end",
    cell: (s) => <GradeCount count={s.grade_5} />,
  },
  {
    id: "success",
    header: "Успеваемость",
    width: 150,
    align: "end",
    cell: (s) => (
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.metricValue}`}
      >
        {formatPercent(s.success_rate)}
      </span>
    ),
  },
  {
    id: "quality",
    header: "Качество",
    align: "end",
    cell: (s) => (
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.metricValue}`}
      >
        {formatPercent(s.quality_rate)}
      </span>
    ),
  },
];
