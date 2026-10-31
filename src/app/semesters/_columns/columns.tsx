import type { DataGridColumn } from "@ui-kit/components";
import type { Semester } from "@/models";
import { formatDate } from "@/utils";
import styles from "./columns.module.css";

type Phase = "current" | "past" | "upcoming";

const PHASE_LABEL: Record<Phase, string> = {
  current: "Идёт сейчас",
  past: "Завершён",
  upcoming: "Впереди",
};

const PHASE_DOT: Record<Phase, string> = {
  current: styles.dotCurrent,
  past: styles.dotPast,
  upcoming: styles.dotUpcoming,
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Даты приходят строками YYYY-MM-DD, их можно сравнивать как строки.
// Сегодня берём в часовом поясе пользователя (toISOString дал бы дату по UTC)
const todayISO = (): string => new Date().toLocaleDateString("sv-SE");
const dayNumber = (iso: string): number => Date.parse(`${iso}T00:00:00Z`) / DAY_MS;

function getPhase(s: Semester): Phase {
  const today = todayISO();
  if (today < s.start_date) return "upcoming";
  if (today > s.end_date) return "past";
  return "current";
}

// Число дней от начала до конца включительно
const lengthInDays = (s: Semester): number =>
  dayNumber(s.end_date) - dayNumber(s.start_date) + 1;

const weeksCount = (s: Semester): number => Math.max(1, Math.round(lengthInDays(s) / 7));

// Какая доля семестра уже прошла, от 0 до 1
const progress = (s: Semester): number =>
  Math.min(1, Math.max(0, (dayNumber(todayISO()) - dayNumber(s.start_date) + 1) / lengthInDays(s)));

// 1 неделя, 2–4 недели, 5–20 недель, 21 неделя ...
function weeksLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} неделя`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} недели`;
  return `${n} недель`;
}

export const semesterColumns: DataGridColumn<Semester>[] = [
  {
    id: "academic_year",
    header: "Учебный год",
    width: 200,
    cell: (s) => {
      const phase = getPhase(s);
      return (
        <div className={styles.stackCell}>
          <span
            className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.primaryText}`}
          >
            {s.academic_year_start}/{s.academic_year_start + 1}
          </span>
          <span
            className={`CaptionTextBlockStyle ${styles.status} ${
              phase === "current" ? styles.statusCurrent : ""
            }`}
          >
            <span className={`${styles.dot} ${PHASE_DOT[phase]}`} aria-hidden="true" />
            {PHASE_LABEL[phase]}
          </span>
        </div>
      );
    },
  },
  {
    id: "term_number",
    header: "Семестр",
    width: 180,
    cell: (s) => (
      <div className={styles.stackCell}>
        <span className={`BodyTextBlockStyle ${styles.primaryText}`}>
          {s.term_number}-й семестр
        </span>
        <span className={`CaptionTextBlockStyle ${styles.subtext}`}>
          {s.term_number === 1 ? "осенний" : "весенний"}
        </span>
      </div>
    ),
  },
  {
    id: "start_date",
    header: "Начало",
    width: 150,
    cell: (s) => (
      <span className={`BodyTextBlockStyle ${styles.date}`}>
        {formatDate(s.start_date)}
      </span>
    ),
  },
  {
    id: "end_date",
    header: "Окончание",
    width: 150,
    cell: (s) => (
      <span className={`BodyTextBlockStyle ${styles.date}`}>
        {formatDate(s.end_date)}
      </span>
    ),
  },
  {
    id: "length",
    header: "Длительность",
    cell: (s) => {
      const isCurrent = getPhase(s) === "current";
      return (
        <div className={styles.stackCell}>
          <span className={`BodyTextBlockStyle ${styles.primaryText}`}>
            {weeksLabel(weeksCount(s))}
          </span>
          {isCurrent && (
            <span
              className={styles.track}
              role="progressbar"
              aria-label="Прошло от семестра"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress(s) * 100)}
            >
              <span className={styles.fill} style={{ width: `${progress(s) * 100}%` }} />
            </span>
          )}
        </div>
      );
    },
  },
];
