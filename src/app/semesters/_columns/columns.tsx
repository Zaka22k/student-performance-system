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

const todayISO = (): string => new Date().toLocaleDateString("sv-SE");
const dayNumber = (iso: string): number =>
  Date.parse(`${iso}T00:00:00Z`) / DAY_MS;

function getPhase(s: Semester): Phase {
  const today = todayISO();
  if (today < s.start_date) return "upcoming";
  if (today > s.end_date) return "past";
  return "current";
}

const lengthInDays = (s: Semester): number =>
  dayNumber(s.end_date) - dayNumber(s.start_date) + 1;

const weeksCount = (s: Semester): number =>
  Math.max(1, Math.round(lengthInDays(s) / 7));

function weeksLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} неделя`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return `${n} недели`;
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
            <span
              className={`${styles.dot} ${PHASE_DOT[phase]}`}
              aria-hidden="true"
            />
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
      return (
        <span className={`BodyTextBlockStyle ${styles.primaryText}`}>
          {weeksLabel(weeksCount(s))}
        </span>
      );
    },
  },
];
