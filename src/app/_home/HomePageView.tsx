"use client";

import type { ComponentType, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Button, List, Page, type ListItemState } from "@ui-kit/components";
import {
  AnalyticsIcon,
  DictionariesIcon,
  JournalIcon,
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
  tone: string;
}

const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    href: "/performance/new",
    title: "Новая запись",
    text: "Внести оценку или зачёт в журнал",
    icon: JournalIcon,
    tone: "var(--system-blue)",
  },
  {
    href: "/session/sheet",
    title: "Ведомость группы",
    text: "Создать записи сразу для всей группы",
    icon: SessionIcon,
    tone: "var(--system-green)",
  },
  {
    href: "/session/schedule",
    title: "Расписание сессии",
    text: "Даты экзаменов и зачётов по группам",
    icon: SessionIcon,
    tone: "var(--system-orange)",
  },
  {
    href: "/analytics/rating",
    title: "Рейтинг студентов",
    text: "Места, суммы оценок и средний балл",
    icon: AnalyticsIcon,
    tone: "var(--system-purple)",
  },
  {
    href: "/reports/group-summary",
    title: "Сводка по группе",
    text: "Все результаты группы за семестр",
    icon: ReportsIcon,
    tone: "var(--system-indigo)",
  },
  {
    href: "/students",
    title: "Студенты",
    text: "Найти студента или изменить данные",
    icon: DictionariesIcon,
    tone: "var(--system-teal)",
  },
];

function QuickCard({
  action,
  state,
}: {
  action: QuickAction;
  state: ListItemState;
}) {
  const Icon = action.icon;
  return (
    <div
      className={styles.card}
      data-active={state.active || undefined}
      style={{ "--tone": action.tone } as CSSProperties}
    >
      <span className={styles.cardIcon}>
        <Icon size={22} />
      </span>
      <div className={styles.cardInfo}>
        <span
          className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.cardTitle}`}
        >
          {action.title}
        </span>
        <span className={`CaptionTextBlockStyle ${styles.cardText}`}>
          {action.text}
        </span>
      </div>
    </div>
  );
}

const formatNumber = (value: number | null, digits = 0) =>
  value === null ? "—" : value.toFixed(digits).replace(".", ",");

function UpcomingRow({ event }: { event: UpcomingEvent }) {
  const type =
    ASSESSMENT_LABELS[event.assessmentType as keyof typeof ASSESSMENT_LABELS] ??
    event.assessmentType;
  return (
    <div className={styles.event}>
      <span
        className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.eventDate}`}
      >
        {formatDate(event.date)}
      </span>
      <span className={styles.eventMain}>
        <span className={`BodyTextBlockStyle ${styles.eventTitle}`}>
          {event.subjectName}
        </span>
        <span className={`CaptionTextBlockStyle ${styles.eventText}`}>
          {event.groupCode} · {type}
        </span>
      </span>
    </div>
  );
}

export default function HomePageView({ summary }: { summary: HomeSummary }) {
  const router = useRouter();
  const open = (href: string) => router.push(href);

  const stats = [
    { label: "Студентов учится", value: formatNumber(summary.students) },
    { label: "Групп", value: formatNumber(summary.groups) },
    {
      label: "Средний балл семестра",
      value: formatNumber(summary.averageGrade, 2),
    },
    {
      label: "Успеваемость",
      value:
        summary.successRate === null
          ? "—"
          : `${formatNumber(summary.successRate, 1)}%`,
    },
  ];

  return (
    <Page title="Главная" hero={<HomeHero />}>
      <div className={styles.content}>
        <section className={styles.intro}>
          <h1 className={`TitleLargeTextBlockStyle ${styles.title}`}>
            Учёт успеваемости студентов
          </h1>
          <p className={`BodyLargeTextBlockStyle ${styles.lead}`}>
            Журнал, сессия, аналитика и отчёты в одном месте.
            {summary.semester && (
              <> Последний семестр в базе: {semesterLabel(summary.semester)}.</>
            )}
          </p>
          <div className={styles.introActions}>
            <Button appearance="primary" onClick={() => open("/performance")}>
              Открыть журнал
            </Button>
            <Button onClick={() => open("/session/sheet")}>
              Сформировать ведомость
            </Button>
          </div>
        </section>

        <section aria-label="Показатели" className={styles.stats}>
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

        <section className={styles.section}>
          <h2 className={`SubtitleTextBlockStyle ${styles.sectionTitle}`}>
            Быстрый переход
          </h2>
          <List
            aria-label="Быстрый переход"
            layout="horizontal"
            items={QUICK_ACTIONS}
            getItemId={(a) => a.href}
            itemWidth={285}
            itemHeight={85}
            gap={12}
            itemAppearance="none"
            onItemClick={(a) => open(a.href)}
            onItemActivate={(a) => open(a.href)}
            renderItem={(a, state) => <QuickCard action={a} state={state} />}
          />
        </section>

        <section className={styles.section}>
          <h2 className={`SubtitleTextBlockStyle ${styles.sectionTitle}`}>
            Ближайшие экзамены и зачёты
          </h2>
          <List
            aria-label="Ближайшие экзамены и зачёты"
            items={summary.upcoming}
            getItemId={(e) => e.id}
            itemHeight={60}
            emptyContent="Ближайших экзаменов и зачётов нет"
            onItemClick={() => open("/session/schedule")}
            renderItem={(e) => <UpcomingRow event={e} />}
          />
        </section>
      </div>
    </Page>
  );
}
