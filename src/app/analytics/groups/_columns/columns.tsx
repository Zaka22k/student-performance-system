import type { DataGridColumn } from "@ui-kit/components";
import type { GroupStat } from "@/models";
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

export const groupStatColumns: DataGridColumn<GroupStat>[] = [
  {
    id: "group",
    header: "Группа",
    width: 320,
    cell: (g) => (
      <span className={styles.groupCell} title={g.group_name}>
        <span className={`CaptionTextBlockStyle ${styles.groupTag}`}>
          {g.group_code}
        </span>
        <span className={`BodyTextBlockStyle ${styles.groupName}`}>
          {g.group_name}
        </span>
      </span>
    ),
  },
  {
    id: "students",
    header: "Студентов",
    width: 120,
    align: "end",
    cell: (g) => (
      <span className={`BodyTextBlockStyle ${styles.count}`}>
        {g.students_count}
      </span>
    ),
  },
  {
    id: "records",
    header: "Результатов",
    width: 130,
    align: "end",
    cell: (g) => (
      <span className={`BodyTextBlockStyle ${styles.count}`}>{g.records}</span>
    ),
  },
  {
    id: "average",
    header: "Средняя оценка",
    width: 160,
    align: "end",
    cell: (g) => (
      <Metric
        text={formatAverage(g.average_grade)}
        share={
          g.average_grade === null
            ? null
            : (g.average_grade - MIN_GRADE) / (MAX_GRADE - MIN_GRADE)
        }
        low={g.average_grade !== null && g.average_grade < 3}
      />
    ),
  },
  {
    id: "success",
    header: "Успеваемость",
    width: 150,
    align: "end",
    cell: (g) => (
      <Metric
        text={formatPercent(g.success_rate)}
        share={g.success_rate === null ? null : g.success_rate / 100}
        low={g.success_rate !== null && g.success_rate < 50}
      />
    ),
  },
  {
    id: "quality",
    header: "Качество",
    align: "end",
    cell: (g) => (
      <Metric
        text={formatPercent(g.quality_rate)}
        share={g.quality_rate === null ? null : g.quality_rate / 100}
      />
    ),
  },
];
