import type { DataGridColumn } from "@/components";
import type { Subject } from "@/models";
import styles from "./columns.module.css";

export const subjectColumns: DataGridColumn<Subject>[] = [
  {
    id: "subject_code",
    header: "Код",
    width: 140,
    cell: (s) => (
      <span className={`CaptionTextBlockStyle ${styles.codeBadge}`}>
        {s.subject_code}
      </span>
    ),
  },
  {
    id: "subject_name",
    header: "Название",
    width: 380,
    cell: (s) => (
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.nameText}`}
        title={s.subject_name}
      >
        {s.subject_name}
      </span>
    ),
  },
  {
    id: "total_hours",
    header: "Часы",
    width: 110,
    align: "end",
    cell: (s) => (
      <span className={`CaptionTextBlockStyle ${styles.hoursTag}`}>
        {s.total_hours}
        <span className={styles.unit}>ч.</span>
      </span>
    ),
  },
  {
    id: "credits",
    header: "Зачётные единицы",
    align: "end",
    cell: (s) => (
      <span className={`CaptionTextBlockStyle ${styles.creditsPill}`}>
        {s.credits}
        <span className={styles.creditsUnit}>з.е.</span>
      </span>
    ),
  },
];
