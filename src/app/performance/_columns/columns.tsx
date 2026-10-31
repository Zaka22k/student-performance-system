import type { DataGridColumn } from "@ui-kit/components";
import type { Performance } from "@/models";
import { formatDate, semesterLabel } from "@/utils";
import { ASSESSMENT_LABELS, formatResult } from "../constants";
import styles from "./columns.module.css";

// Оттенок результата: цвет только у оценок, и это один оттенок акцента разной насыщенности.
// Красный остаётся для неудачи, потому что он несёт смысл
type ResultTone = "excellent" | "good" | "satisfactory" | "passed" | "fail";

function getResultTone(p: Performance): ResultTone {
  if (p.assessment_type === "credit") return p.passed === true ? "passed" : "fail";
  if (p.grade === 5) return "excellent";
  if (p.grade === 4) return "good";
  if (p.grade === 3) return "satisfactory";
  return "fail";
}

// «Иванов Иван Иванович» → «ИИ»
const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

// 2027-01-11 → «пн»
const weekday = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("ru-RU", {
    weekday: "short",
    timeZone: "UTC",
  });

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
          <span className={styles.groupTag}>{p.group_code}</span>
          <span className={styles.number}>№ {p.student_number}</span>
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
    width: 220,
    cell: (p) => (
      <span className={styles.typeCell}>
        <span
          className={`${styles.marker} ${styles[`type_${p.assessment_type}`] ?? ""}`}
          aria-hidden="true"
        />
        <span className={`BodyTextBlockStyle ${styles.typeLabel}`}>
          {ASSESSMENT_LABELS[p.assessment_type]}
        </span>
      </span>
    ),
  },
  {
    id: "result",
    header: "Результат",
    width: 200,
    align: "end",
    cell: (p) => (
      <div className={styles.resultCell}>
        {p.attempt_number > 1 && (
          <span
            className={`CaptionTextBlockStyle ${styles.attempt}`}
            title={`Попытка № ${p.attempt_number}`}
          >
            {p.attempt_number}-я попытка
          </span>
        )}
        <span
          className={`BodyTextBlockStyle ${styles.result} ${styles[`result_${getResultTone(p)}`]}`}
        >
          {formatResult(p)}
        </span>
      </div>
    ),
  },
  {
    id: "teacher",
    header: "Преподаватель",
    width: 240,
    cell: (p) => (
      <div className={styles.person} title={p.teacher_name}>
        <span
          className={`CaptionTextBlockStyle ${styles.avatar}`}
          aria-hidden="true"
        >
          {initials(p.teacher_name)}
        </span>
        <span className={`BodyTextBlockStyle ${styles.personName}`}>
          {p.teacher_name}
        </span>
      </div>
    ),
  },
  {
    id: "date",
    header: "Дата",
    width: 140,
    align: "end",
    cell: (p) => (
      <span className={styles.date}>
        <span className={`CaptionTextBlockStyle ${styles.weekday}`}>
          {weekday(p.assessment_date)}
        </span>
        <span className={`BodyTextBlockStyle ${styles.dateValue}`}>
          {formatDate(p.assessment_date)}
        </span>
      </span>
    ),
  },
];
