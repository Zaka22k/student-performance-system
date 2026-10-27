import type { DataGridColumn } from "@ui-kit/components";
import type { ScheduleItem } from "@/models";
import { formatDate } from "@/utils";
import { ASSESSMENT_LABELS } from "../../../performance/constants";
import styles from "./columns.module.css";

export const scheduleRowId = (r: ScheduleItem) =>
  [
    r.assessment_date,
    r.group_id,
    r.subject_id,
    r.assessment_type,
    r.attempt_number,
    r.teacher_id,
  ].join("|");

export const scheduleColumns: DataGridColumn<ScheduleItem>[] = [
  {
    id: "date",
    header: "Дата",
    width: 120,
    cell: (r) => (
      <span className={`CaptionTextBlockStyle ${styles.dateTag}`}>
        {formatDate(r.assessment_date)}
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
    id: "subject",
    header: "Дисциплина",
    width: 280,
    cell: (r) => (
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.subjectText}`}
        title={r.subject_name}
      >
        {r.subject_name}
      </span>
    ),
  },
  {
    id: "type",
    header: "Вид контроля",
    width: 250,
    cell: (r) => (
      <div className={styles.typeCell}>
        <span
          className={`CaptionTextBlockStyle ${styles.typePill} ${
            styles[`type_${r.assessment_type}`] ?? ""
          }`}
        >
          {ASSESSMENT_LABELS[r.assessment_type]}
        </span>
        {r.attempt_number > 1 && (
          <span className={`CaptionTextBlockStyle ${styles.attemptBadge}`}>
            попытка {r.attempt_number}
          </span>
        )}
      </div>
    ),
  },
  {
    id: "teacher",
    header: "Преподаватель",
    width: 220,
    cell: (r) => (
      <span
        className={`BodyTextBlockStyle ${styles.teacherText}`}
        title={r.teacher_name}
      >
        {r.teacher_name}
      </span>
    ),
  },
  {
    id: "count",
    header: "Студентов",
    align: "end",
    cell: (r) => (
      <span className={`CaptionTextBlockStyle ${styles.countPill}`}>
        {r.students_count}
      </span>
    ),
  },
];
