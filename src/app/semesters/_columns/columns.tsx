import type { DataGridColumn } from "@/components";
import type { Semester } from "@/models";
import { formatDate } from "@/utils";
import styles from "./columns.module.css";

export const semesterColumns: DataGridColumn<Semester>[] = [
  {
    id: "academic_year",
    header: "Учебный год",
    width: 160,
    cell: (s) => (
      <span className={`CaptionTextBlockStyle ${styles.yearBadge}`}>
        {s.academic_year_start}/{s.academic_year_start + 1}
      </span>
    ),
  },
  {
    id: "term_number",
    header: "Семестр",
    width: 140,
    align: "end",
    cell: (s) => (
      <span
        className={`CaptionTextBlockStyle ${styles.termPill} ${
          s.term_number === 1 ? styles.term1 : styles.term2
        }`}
      >
        {s.term_number}-й семестр
      </span>
    ),
  },
  {
    id: "start_date",
    header: "Начало",
    width: 160,
    cell: (s) => (
      <span className={`CaptionTextBlockStyle ${styles.dateTag}`}>
        {formatDate(s.start_date)}
      </span>
    ),
  },
  {
    id: "end_date",
    header: "Окончание",
    cell: (s) => (
      <span className={`CaptionTextBlockStyle ${styles.dateTag}`}>
        {formatDate(s.end_date)}
      </span>
    ),
  },
];
