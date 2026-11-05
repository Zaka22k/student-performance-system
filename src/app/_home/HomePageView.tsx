"use client";

import type { ComponentType, CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Page } from "@ui-kit/components";
import {
  AnalyticsIcon,
  DictionariesIcon,
  PlusIcon,
  ReportsIcon,
  SessionIcon,
} from "@/icons";
import type { HomeSummary, UpcomingEvent } from "@/server/home";
import { ASSESSMENT_LABELS } from "@/app/performance/constants";
import { formatDate, semesterLabel } from "@/utils";
import HomeHero from "./HomeHero";
import styles from "./Home.module.css";

interface QuickAction {
  href: string;
  title: string;
  text: string;
  icon: ComponentType<{ size?: number | string }>;
  /** Карточка видна, если у пользователя есть любое из этих разрешений. */
  needs: readonly string[];
  /** Другой текст для тех, у кого нет `fullAccess` (например, «свои» данные). */
  limitedText?: string;
  fullAccess?: string;
}

// Порядок карточек: сначала то, что делают чаще, затем отчёты и справочники.
const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    href: "/performance/new",
    title: "Новая запись",
    text: "Внести оценку или зачёт в журнал",
    icon: PlusIcon,
    needs: ["grades.create"],
  },
  {
    href: "/session/sheet",
    title: "Формирование ведомости",
    text: "Создать записи сразу для всей группы",
    icon: SessionIcon,
    needs: ["session.sheet.form"],
  },
  {
    href: "/session/schedule",
    title: "Расписание сессии",
    text: "Даты экзаменов и зачётов по группам",
    limitedText: "Даты экзаменов и зачётов вашей группы",
    fullAccess: "session.schedule.read.all",
    icon: SessionIcon,
    needs: ["session.schedule.read.all", "session.schedule.read.own"],
  },
  {
    href: "/reports/student-book",
    title: "Зачётная книжка",
    text: "Оценки и зачёты студента за всё время или за семестр",
    limitedText: "Ваши оценки и зачёты за всё время или за семестр",
    fullAccess: "reports.student_book.all",
    icon: ReportsIcon,
    needs: ["reports.student_book.all", "reports.student_book.own"],
  },
  {
    href: "/analytics/rating",
    title: "Рейтинг студентов",
    text: "Места, суммы оценок и средний балл",
    icon: AnalyticsIcon,
    needs: ["analytics.read"],
  },
  {
    href: "/reports/group-summary",
    title: "Сводка по группе",
    text: "Все результаты группы за семестр",
    icon: ReportsIcon,
    needs: ["reports.group_summary"],
  },
  {
    href: "/reports/group-sheet",
    title: "Ведомость по дисциплине",
    text: "Результаты группы по одной дисциплине",
    icon: ReportsIcon,
    needs: ["reports.group_sheet"],
  },
  {
    href: "/students",
    title: "Студенты",
    text: "Найти студента или изменить данные",
    limitedText: "Найти студента и посмотреть данные",
    fullAccess: "dictionaries.manage",
    icon: DictionariesIcon,
    needs: ["dictionaries.read"],
  },
];

const MONTHS = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

const formatNumber = (value: number | null, digits = 0) =>
  value === null ? "—" : value.toFixed(digits).replace(".", ",");

function QuickCard({
  action,
  text,
}: {
  action: QuickAction;
  text: string;
}) {
  const Icon = action.icon;
  return (
    <Link href={action.href} className={styles.card}>
      <span className={styles.cardIcon}>
        <Icon size={20} />
      </span>
      <span className={styles.cardBody}>
        <span
          className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.cardTitle}`}
        >
          {action.title}
        </span>
        <span className={`CaptionTextBlockStyle ${styles.cardText}`}>
          {text}
        </span>
      </span>
    </Link>
  );
}

function UpcomingRow({ event }: { event: UpcomingEvent }) {
  const type =
    ASSESSMENT_LABELS[event.assessmentType as keyof typeof ASSESSMENT_LABELS] ??
    event.assessmentType;
  const [, month, day] = event.date.split("-");
  return (
    <li className={styles.event}>
      <time className={styles.eventDate} dateTime={event.date}>
        <span className={styles.srOnly}>{formatDate(event.date)}</span>
        <span className={styles.eventDay} aria-hidden="true">
          {Number(day)}
        </span>
        <span className={styles.eventMonth} aria-hidden="true">
          {MONTHS[Number(month) - 1]}
        </span>
      </time>
      <span className={styles.eventMain}>
        <span className={`BodyTextBlockStyle ${styles.eventTitle}`}>
          {event.subjectName}
        </span>
        <span className={`CaptionTextBlockStyle ${styles.eventText}`}>
          {event.groupCode}, {type}
        </span>
      </span>
    </li>
  );
}

export default function HomePageView({ summary }: { summary: HomeSummary }) {
  const router = useRouter();
  const permissions = new Set(summary.permissions);
  const can = (...codes: string[]) => codes.some((c) => permissions.has(c));
  const own = summary.scope === "own";

  const canJournal = can("grades.read.all", "grades.read.own");
  const canSchedule = can(
    "session.schedule.read.all",
    "session.schedule.read.own",
  );

  const actions = QUICK_ACTIONS.filter((a) => can(...a.needs)).map((a) => ({
    action: a,
    text:
      a.limitedText && a.fullAccess && !permissions.has(a.fullAccess)
        ? a.limitedText
        : a.text,
  }));

  // Показатели: только те, что считаются для роли и не вводят в заблуждение.
  const stats: { label: string; value: string }[] = [];
  if (can("dictionaries.read")) {
    stats.push(
      { label: "Студентов учится", value: formatNumber(summary.students) },
      { label: "Групп", value: formatNumber(summary.groups) },
    );
  }
  if (canJournal) {
    stats.push(
      {
        label: own ? "Ваш средний балл" : "Средний балл семестра",
        value: formatNumber(summary.averageGrade, 2),
      },
      {
        label: own ? "Ваша успеваемость" : "Успеваемость",
        value:
          summary.successRate === null
            ? "—"
            : `${formatNumber(summary.successRate, 1)}%`,
      },
    );
  }

  const hasActions = actions.length > 0;
  const solo = !(hasActions && canSchedule);
  const isEmpty =
    !canJournal && !canSchedule && !hasActions && stats.length === 0;

  // Вводный текст описывает только то, что роль действительно видит.
  let lead = "Журнал, сессия, аналитика и отчёты в одном месте.";
  if (isEmpty) {
    lead = "Доступные вам разделы открываются в меню слева.";
  } else if (own && canJournal) {
    lead = canSchedule
      ? "Ваши оценки и расписание сессии."
      : "Ваши оценки по дисциплинам.";
  } else if (own && canSchedule) {
    lead = "Расписание сессии вашей группы.";
  }

  return (
    <Page title="Главная" hero={<HomeHero />}>
      <div className={styles.content}>
        <section className={styles.intro}>
          <h1 className={`TitleLargeTextBlockStyle ${styles.title}`}>
            Учёт успеваемости студентов
          </h1>
          <p className={`BodyLargeTextBlockStyle ${styles.lead}`}>
            {lead}
            {summary.semester && !isEmpty && (
              <> Последний семестр в базе: {semesterLabel(summary.semester)}.</>
            )}
          </p>
          {canJournal && (
            <div className={styles.introActions}>
              <Button
                appearance="primary"
                onClick={() => router.push("/performance")}
              >
                Открыть журнал
              </Button>
            </div>
          )}
        </section>

        {stats.length > 0 && (
          <section
            aria-label="Показатели"
            className={styles.stats}
            style={{ "--cols": stats.length } as CSSProperties}
          >
            {stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={`TitleTextBlockStyle ${styles.statValue}`}>
                  {s.value}
                </span>
                <span className={`CaptionTextBlockStyle ${styles.statLabel}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </section>
        )}

        {(hasActions || canSchedule) && (
          <div className={styles.main} data-solo={solo || undefined}>
            {hasActions && (
              <section
                className={styles.section}
                aria-labelledby="home-actions"
              >
                <h2
                  id="home-actions"
                  className={`SubtitleTextBlockStyle ${styles.sectionTitle}`}
                >
                  Быстрый переход
                </h2>
                <div className={styles.cards}>
                  {actions.map(({ action, text }) => (
                    <QuickCard key={action.href} action={action} text={text} />
                  ))}
                </div>
              </section>
            )}

            {canSchedule && (
              <section
                className={styles.section}
                aria-labelledby="home-upcoming"
              >
                <h2
                  id="home-upcoming"
                  className={`SubtitleTextBlockStyle ${styles.sectionTitle}`}
                >
                  Ближайшие экзамены и зачёты
                </h2>
                <div className={styles.panel}>
                  {summary.upcoming.length > 0 ? (
                    <ol className={styles.events}>
                      {summary.upcoming.map((e) => (
                        <UpcomingRow key={e.id} event={e} />
                      ))}
                    </ol>
                  ) : (
                    <p className={`BodyTextBlockStyle ${styles.empty}`}>
                      Ближайших экзаменов и зачётов нет
                    </p>
                  )}
                  <Link
                    href="/session/schedule"
                    className={`BodyTextBlockStyle ${styles.panelLink}`}
                  >
                    Всё расписание
                  </Link>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </Page>
  );
}
