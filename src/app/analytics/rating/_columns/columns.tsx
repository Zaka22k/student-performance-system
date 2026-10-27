import type { DataGridColumn } from "@/components";
import type { RatingItem } from "@/models";
import { formatAverage } from "../../format";
import styles from "./columns.module.css";

function getPlaceClass(place: number): string {
  if (place === 1) return styles.place1;
  if (place === 2) return styles.place2;
  if (place === 3) return styles.place3;
  return styles.placeDefault;
}

function getAvgClass(avg: number | null): string {
  if (avg === null) return styles.avgEmpty;
  if (avg >= 4.5) return styles.avgHigh;
  if (avg >= 3.5) return styles.avgMedium;
  return styles.avgLow;
}

export const ratingColumns: DataGridColumn<RatingItem>[] = [
  {
    id: "place",
    header: "Место",
    width: 90,
    align: "end",
    cell: (r) => (
      <span
        className={`CaptionTextBlockStyle ${styles.placeBadge} ${getPlaceClass(
          r.place,
        )}`}
      >
        #{r.place}
      </span>
    ),
  },
  {
    id: "student",
    header: "Студент",
    width: 280,
    cell: (r) => (
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.studentName}`}
        title={r.student_name}
      >
        {r.student_name}
      </span>
    ),
  },
  {
    id: "number",
    header: "Номер",
    width: 130,
    cell: (r) => (
      <span className={`CaptionTextBlockStyle ${styles.numberBadge}`}>
        {r.student_number}
      </span>
    ),
  },
  {
    id: "group",
    header: "Группа",
    width: 120,
    cell: (r) => (
      <span className={`CaptionTextBlockStyle ${styles.groupBadge}`}>
        {r.group_code}
      </span>
    ),
  },
  {
    id: "sum",
    header: "Сумма оценок",
    width: 150,
    align: "end",
    cell: (r) => (
      <span className={`CaptionTextBlockStyle ${styles.sumBadge}`}>
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
        <span className={`BodyTextBlockStyle ${styles.avgEmpty}`}>
          {formatAverage(r.average_grade)}
        </span>
      ) : (
        <span
          className={`CaptionTextBlockStyle ${styles.avgPill} ${getAvgClass(
            r.average_grade,
          )}`}
        >
          {formatAverage(r.average_grade)}
        </span>
      ),
  },
];
