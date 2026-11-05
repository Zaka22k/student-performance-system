import { type DataGridColumn, PersonPicture } from "@ui-kit/components";
import type { Performance } from "@/models";
import { formatDate, semesterLabel } from "@/utils";
import { ASSESSMENT_LABELS, formatResult } from "../constants";
import styles from "./columns.module.css";

// Оттенок результата: цвет только у оценок, и это один оттенок акцента разной насыщенности.
// Красный остаётся для неудачи, потому что он несёт смысл
type ResultTone = "excellent" | "good" | "satisfactory" | "passed" | "fail";

function getResultTone(p: Performance): ResultTone {
  if (p.assessment_type === "credit")
    return p.passed === true ? "passed" : "fail";
  if (p.grade === 5) return "excellent";
  if (p.grade === 4) return "good";
  if (p.grade === 3) return "satisfactory";
  return "fail";
}

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
      <PersonPicture
        size={26}
        showLabel
        displayName={p.student_name}
        secondaryLabel={`${p.group_code} | ${p.student_number}`}
      />
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
      <PersonPicture size={26} showLabel displayName={p.teacher_name} />
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
