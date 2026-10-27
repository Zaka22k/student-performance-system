import type { DataGridColumn } from "@ui-kit/components";
import type { Performance } from "@/models";
import { formatDate, semesterLabel } from "@/utils";
import { ASSESSMENT_LABELS, formatResult } from "../constants";
import styles from "./columns.module.css";

function getResultClassName(p: Performance): string {
  if ((p.assessment_type === "credit" && p.passed === true) || p.grade === 5) {
    return styles.resultExcellent;
  }
  if (p.grade === 4) {
    return styles.resultGood;
  }
  if (p.grade === 3) {
    return styles.resultSatisfactory;
  }
  return styles.resultFail;
}

export const performanceColumns: DataGridColumn<Performance>[] = [
  {
    id: "student",
    header: "Студент",
    width: 260,
    cell: (p) => (
      <div
        className={styles.stackCell}
        title={`${p.student_name} (${p.group_code}, № ${p.student_number})`}
      >
        <span
          className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.primaryText}`}
        >
          {p.student_name}
        </span>
        <span className={`CaptionTextBlockStyle ${styles.subtext}`}>
          <span className={styles.groupAccent}>{p.group_code}</span>
          <span className={styles.dotSeparator} aria-hidden="true">
            •
          </span>
          <span>№ {p.student_number}</span>
        </span>
      </div>
    ),
  },
  {
    id: "subject",
    header: "Дисциплина",
    width: 280,
    cell: (p) => {
      const semester = semesterLabel(p);
      return (
        <div
          className={styles.stackCell}
          title={`${p.subject_name} (${semester})`}
        >
          <span
            className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.primaryText}`}
          >
            {p.subject_name}
          </span>
          <span className={`CaptionTextBlockStyle ${styles.subtext}`}>
            {semester}
          </span>
        </div>
      );
    },
  },
  {
    id: "type",
    header: "Вид контроля",
    width: 190,
    cell: (p) => (
      <span
        className={`CaptionTextBlockStyle ${styles.typeBadge} ${
          styles[`type_${p.assessment_type}`] ?? ""
        }`}
      >
        {ASSESSMENT_LABELS[p.assessment_type]}
      </span>
    ),
  },
  {
    id: "result",
    header: "Результат",
    width: 160,
    align: "end",
    cell: (p) => (
      <div className={styles.resultCell}>
        {p.attempt_number > 1 && (
          <span
            className={`CaptionTextBlockStyle ${styles.attemptBadge}`}
            title={`Попытка №${p.attempt_number}`}
          >
            {p.attempt_number}-я поп.
          </span>
        )}
        <span
          className={`CaptionTextBlockStyle ${styles.resultPill} ${getResultClassName(
            p,
          )}`}
        >
          {formatResult(p)}
        </span>
      </div>
    ),
  },
  {
    id: "teacher",
    header: "Преподаватель",
    width: 200,
    cell: (p) => (
      <span
        className={`BodyTextBlockStyle ${styles.teacherText}`}
        title={p.teacher_name}
      >
        {p.teacher_name}
      </span>
    ),
  },
  {
    id: "date",
    header: "Дата",
    width: 120,
    align: "end",
    cell: (p) => (
      <span className={`CaptionTextBlockStyle ${styles.dateTag}`}>
        {formatDate(p.assessment_date)}
      </span>
    ),
  },
];
