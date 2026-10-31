import type { DataGridColumn } from "@ui-kit/components";
import type { RatingItem } from "@/models";
import { formatAverage } from "../../format";
import styles from "./columns.module.css";

// Тройка лидеров выделена одним оттенком акцента разной насыщенности, остальные места без плашки
const PLACE_CLASS: Record<number, string> = {
  1: styles.place1,
  2: styles.place2,
  3: styles.place3,
};

// Оценки лежат в диапазоне 2–5: шкала показывает, где средний балл между ними
const MIN_GRADE = 2;
const MAX_GRADE = 5;

const scaleShare = (avg: number): number =>
  Math.min(1, Math.max(0, (avg - MIN_GRADE) / (MAX_GRADE - MIN_GRADE)));

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
      <div
        className={styles.stackCell}
        title={`${r.student_name} (${r.group_code}, № ${r.student_number})`}
      >
        <span
          className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.studentName}`}
        >
          {r.student_name}
        </span>
        <span className={`CaptionTextBlockStyle ${styles.subtext}`}>
          <span className={styles.groupTag}>{r.group_code}</span>
          <span>№ {r.student_number}</span>
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
      <span className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.sum}`}>
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
        <div className={styles.average}>
          <span className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.averageValue}`}>
            {formatAverage(r.average_grade)}
          </span>
          <span className={styles.track} aria-hidden="true">
            <span
              className={`${styles.fill} ${r.average_grade < 3 ? styles.fillLow : ""}`}
              style={{ width: `${scaleShare(r.average_grade) * 100}%` }}
            />
          </span>
        </div>
      ),
  },
];
