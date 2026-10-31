import type { DataGridColumn } from "@ui-kit/components";
import type { SubjectStat } from "@/models";
import { formatAverage, formatPercent } from "../../format";
import styles from "./columns.module.css";

// Оценки лежат в диапазоне 2–5: шкала показывает, где средняя оценка между ними
const MIN_GRADE = 2;
const MAX_GRADE = 5;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

interface MetricProps {
  text: string;
  share: number | null; // доля шкалы от 0 до 1; null — данных нет
  low?: boolean; // тревожное значение: шкала красная
}

// Число и тонкая шкала под ним. Нет данных — тихий прочерк без шкалы
function Metric({ text, share, low }: MetricProps) {
  if (share === null) {
    return <span className={`BodyTextBlockStyle ${styles.empty}`}>{text}</span>;
  }
  return (
    <div className={styles.metric}>
      <span className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.metricValue}`}>
        {text}
      </span>
      <span className={styles.track} aria-hidden="true">
        <span
          className={`${styles.fill} ${low ? styles.fillLow : ""}`}
          style={{ width: `${clamp01(share) * 100}%` }}
        />
      </span>
    </div>
  );
}

// Сколько раз получена оценка. Нули приглушены, двойки (если есть) красные
function GradeCount({ count, fail }: { count: number; fail?: boolean }) {
  const className = !count
    ? styles.gradeZero
    : fail
      ? styles.gradeFail
      : styles.gradeCount;
  return <span className={`BodyTextBlockStyle ${className}`}>{count || 0}</span>;
}

export const subjectStatColumns: DataGridColumn<SubjectStat>[] = [
  {
    id: "subject",
    header: "Дисциплина",
    width: 340,
    cell: (s) => (
      <div
        className={styles.subjectCell}
        title={`${s.subject_code} — ${s.subject_name}`}
      >
        <span className={`CaptionTextBlockStyle ${styles.codeTag}`}>
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
      <span className={`BodyTextBlockStyle ${styles.count}`}>{s.records}</span>
    ),
  },
  {
    id: "average",
    header: "Средняя оценка",
    width: 160,
    align: "end",
    cell: (s) => (
      <Metric
        text={formatAverage(s.average_grade)}
        share={
          s.average_grade === null
            ? null
            : (s.average_grade - MIN_GRADE) / (MAX_GRADE - MIN_GRADE)
        }
        low={s.average_grade !== null && s.average_grade < 3}
      />
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
      <Metric
        text={formatPercent(s.success_rate)}
        share={s.success_rate === null ? null : s.success_rate / 100}
        low={s.success_rate !== null && s.success_rate < 50}
      />
    ),
  },
  {
    id: "quality",
    header: "Качество",
    align: "end",
    cell: (s) => (
      <Metric
        text={formatPercent(s.quality_rate)}
        share={s.quality_rate === null ? null : s.quality_rate / 100}
      />
    ),
  },
];
