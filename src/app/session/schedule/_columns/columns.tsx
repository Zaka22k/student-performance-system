import { type DataGridColumn, PersonPicture } from "@ui-kit/components";
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

const DAY_MS = 24 * 60 * 60 * 1000;

const todayISO = (): string => new Date().toLocaleDateString("sv-SE");
const dayNumber = (iso: string): number =>
  Date.parse(`${iso}T00:00:00Z`) / DAY_MS;

const weekday = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("ru-RU", {
    weekday: "short",
    timeZone: "UTC",
  });

const daysUntil = (iso: string): number =>
  dayNumber(iso) - dayNumber(todayISO());

function relativeLabel(days: number): string {
  if (days === 0) return "сегодня";
  if (days === 1) return "завтра";
  if (days === -1) return "вчера";
  return days > 0 ? `через ${days} дн.` : `${-days} дн. назад`;
}

export const scheduleColumns: DataGridColumn<ScheduleItem>[] = [
  {
    id: "date",
    header: "Дата",
    width: 170,
    cell: (r) => {
      const days = daysUntil(r.assessment_date);
      return (
        <div className={`${styles.stackCell} ${days < 0 ? styles.past : ""}`}>
          <span
            className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.primaryText}`}
          >
            {formatDate(r.assessment_date)}
          </span>
          <span
            className={`CaptionTextBlockStyle ${styles.subtext} ${
              days === 0 ? styles.today : ""
            }`}
          >
            {weekday(r.assessment_date)}, {relativeLabel(days)}
          </span>
        </div>
      );
    },
  },
  {
    id: "group",
    header: "Группа",
    width: 120,
    cell: (r) => (
      <span className={`CaptionTextBlockStyle ${styles.groupTag}`}>
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
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.primaryText}`}
        title={r.subject_name}
      >
        {r.subject_name}
      </span>
    ),
  },
  {
    id: "type",
    header: "Вид контроля",
    width: 300,
    cell: (r) => (
      <span className={styles.typeCell}>
        <span
          className={`${styles.marker} ${styles[`type_${r.assessment_type}`] ?? ""}`}
          aria-hidden="true"
        />
        <span className={`BodyTextBlockStyle ${styles.typeLabel}`}>
          {ASSESSMENT_LABELS[r.assessment_type]}
        </span>
        {r.attempt_number > 1 && (
          <span className={`CaptionTextBlockStyle ${styles.attempt}`}>
            {r.attempt_number}-я попытка
          </span>
        )}
      </span>
    ),
  },
  {
    id: "teacher",
    header: "Преподаватель",
    width: 240,
    cell: (r) => (
      <PersonPicture size={28} showLabel displayName={r.teacher_name} />
    ),
  },
  {
    id: "count",
    header: "Студентов",
    align: "end",
    cell: (r) => (
      <span className={`BodyTextBlockStyle ${styles.count}`}>
        {r.students_count}
      </span>
    ),
  },
];
