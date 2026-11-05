import type { DataGridColumn } from "@ui-kit/components";
import type { RatingItem } from "@/models";
import { formatAverage } from "../../format";
import styles from "./columns.module.css";

const PLACE_CLASS: Record<number, string> = {
  1: styles.place1,
  2: styles.place2,
  3: styles.place3,
};

export const ratingColumns: DataGridColumn<RatingItem>[] = [
  {
    id: "place",
    header: "Место",
    width: 80,
    cell: (r) => (
      <span
        className={`BodyTextBlockStyle ${styles.place} ${PLACE_CLASS[r.place] ?? styles.placeOther}`}
      >
        {r.place}
      </span>
    ),
  },
  {
    id: "student",
    header: "Студент",
    width: 320,
    cell: (r) => (
      <div className={styles.stackCell}>
        <span
          className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.studentName}`}
        >
          {r.student_name}{" "}
          <span className={styles.groupTag}>{r.group_code}</span>
        </span>
      </div>
    ),
  },
  {
    id: "sum",
    header: "Сумма оценок",
    width: 150,
    align: "end",
    cell: (r) => (
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.sum}`}
      >
        {r.summ_balls}
      </span>
    ),
  },
  {
    id: "average",
    header: "Средний балл",
    align: "end",
    cell: (r) =>
      r.average_grade === null ? (
        <span className={`BodyTextBlockStyle ${styles.empty}`}>
          {formatAverage(r.average_grade)}
        </span>
      ) : (
        <span
          className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.averageValue}`}
        >
          {formatAverage(r.average_grade)}
        </span>
      ),
  },
];
