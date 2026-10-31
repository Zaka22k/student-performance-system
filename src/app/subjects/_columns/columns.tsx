import type { DataGridColumn } from "@ui-kit/components";
import type { Subject } from "@/models";
import styles from "./columns.module.css";

// Зачётные единицы могут быть дробными: 3.5 → «3,5»
const formatCredits = (credits: number): string => String(credits).replace(".", ",");

export const subjectColumns: DataGridColumn<Subject>[] = [
  {
    id: "subject_code",
    header: "Код",
    width: 140,
    cell: (s) => (
      <span className={`CaptionTextBlockStyle ${styles.codeTag}`}>
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
      <span className={`BodyTextBlockStyle ${styles.amount}`}>
        <span className={styles.amountValue}>{s.total_hours}</span>
        <span className={`CaptionTextBlockStyle ${styles.unit}`}>ч</span>
      </span>
    ),
  },
  {
    id: "credits",
    header: "Зачётные единицы",
    align: "end",
    cell: (s) => (
      <span className={`BodyTextBlockStyle ${styles.creditsChip}`}>
        <span>{formatCredits(s.credits)}</span>
        <span className={`CaptionTextBlockStyle ${styles.creditsUnit}`}>з.е.</span>
      </span>
    ),
  },
];
