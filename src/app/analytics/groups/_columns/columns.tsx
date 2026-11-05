import type { DataGridColumn } from "@ui-kit/components";
import type { GroupStat } from "@/models";
import { formatAverage, formatPercent } from "../../format";
import styles from "./columns.module.css";

export const groupStatColumns: DataGridColumn<GroupStat>[] = [
  {
    id: "group",
    header: "Группа",
    width: 320,
    cell: (g) => (
      <span className={`BodyTextBlockStyle ${styles.groupName}`}>
        {g.group_code}
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
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.metricValue}`}
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
    cell: (g) => (
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.metricValue}`}
      >
        {formatPercent(g.success_rate)}
      </span>
    ),
  },
  {
    id: "quality",
    header: "Качество",
    align: "end",
    cell: (g) => (
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.metricValue}`}
      >
        {formatPercent(g.quality_rate)}
      </span>
    ),
  },
];
