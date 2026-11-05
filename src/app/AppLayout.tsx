"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  NavigationView,
  NavItem,
  NavCategory,
  NavSubItem,
} from "@ui-kit/components";
import { useOnlineStatus } from "@/hooks";
import styles from "./AppLayout.module.css";
import {
  JournalIcon,
  DictionariesIcon,
  SessionIcon,
  AnalyticsIcon,
  ReportsIcon,
  SettingsIcon,
  AdminIcon,
  HomeIcon,
} from "@/icons";

type AuthView = {
  permissions: string[];
};

const CATEGORY_PREFIXES = [
  "session",
  "analytics",
  "reports",
  "admin",
  "settings",
];
const DICTIONARY_PAGES = [
  "groups",
  "students",
  "teachers",
  "subjects",
  "semesters",
];

const selectedFromPath = (pathname: string): string => {
  const [first, second] = pathname.split("/").filter(Boolean);
  if (!first) return "/";
  if (CATEGORY_PREFIXES.includes(first) && second) return `/${first}/${second}`;
  return `/${first}`;
};

const categoryFromSelected = (selected: string): string | undefined => {
  const first = selected.split("/")[1];
  if (CATEGORY_PREFIXES.includes(first)) return first;
  if (DICTIONARY_PAGES.includes(first)) return "dictionaries";
  return undefined;
};

export default function AppLayout({
  children,
  currentUser,
}: {
  children: ReactNode;
  currentUser: AuthView | null;
}) {
  useOnlineStatus();
  const pathname = usePathname();

  if (!currentUser) {
    if (pathname === "/login") return <>{children}</>;
    return (
      <main className={styles.ended}>
        <div className={styles.endedBody}>
          <h1 className={styles.endedTitle}>Сессия завершена</h1>
          <p className={styles.endedText}>
            Войдите снова: сессия могла истечь или быть отозвана
            администратором.
          </p>
          <Link href="/login" className={styles.endedLink}>
            Войти снова
          </Link>
        </div>
      </main>
    );
  }

  const permissions = new Set(currentUser.permissions);
  const can = (...codes: string[]) =>
    codes.some((code) => permissions.has(code));
  const selected = selectedFromPath(pathname);
  const openCategory = categoryFromSelected(selected);
  const canSeeSchedule = can(
    "session.schedule.read.all",
    "session.schedule.read.own",
  );
  const canFormSheet = can("session.sheet.form");
  const canSeeGroupSheet = can("reports.group_sheet");
  const canSeeStudentBook = can(
    "reports.student_book.all",
    "reports.student_book.own",
  );
  const canSeeGroupSummary = can("reports.group_summary");
  const canSeeDictionaries = can("dictionaries.read");
  const canSeeAdmin = can("users.manage", "roles.manage", "audit.read");

  return (
    <div style={{ height: "100vh" }}>
      <NavigationView
        paneTitle="АСУ «Успеваемость»"
        extendContentUnderPane
        selectedValue={selected}
        pageKey={pathname}
        defaultOpenCategories={openCategory ? [openCategory] : []}
        pageTransition={(info) =>
          info.relation === "peer" ? "entrance" : "slide"
        }
        menuItems={
          <>
            {can("home.view") && (
              <NavItem as={Link} href="/" value="/" icon={<HomeIcon />}>
                Главная
              </NavItem>
            )}

            {can("grades.read.all", "grades.read.own") && (
              <NavItem
                as={Link}
                href="/performance"
                value="/performance"
                icon={<JournalIcon />}
              >
                Журнал успеваемости
              </NavItem>
            )}

            {canSeeDictionaries && (
              <NavCategory
                value="dictionaries"
                icon={<DictionariesIcon />}
                title="Справочники"
              >
                <NavSubItem as={Link} href="/groups" value="/groups">
                  Группы
                </NavSubItem>
                <NavSubItem as={Link} href="/students" value="/students">
                  Студенты
                </NavSubItem>
                <NavSubItem as={Link} href="/teachers" value="/teachers">
                  Преподаватели
                </NavSubItem>
                <NavSubItem as={Link} href="/subjects" value="/subjects">
                  Дисциплины
                </NavSubItem>
                <NavSubItem as={Link} href="/semesters" value="/semesters">
                  Семестры
                </NavSubItem>
              </NavCategory>
            )}

            {(canSeeSchedule || canFormSheet) && (
              <NavCategory
                value="session"
                icon={<SessionIcon />}
                title="Сессия"
              >
                {canSeeSchedule && (
                  <NavSubItem
                    as={Link}
                    href="/session/schedule"
                    value="/session/schedule"
                  >
                    Расписание экзаменов и зачётов
                  </NavSubItem>
                )}
                {canFormSheet && (
                  <NavSubItem
                    as={Link}
                    href="/session/sheet"
                    value="/session/sheet"
                  >
                    Формирование ведомости группы
                  </NavSubItem>
                )}
              </NavCategory>
            )}

            {can("analytics.read") && (
              <NavCategory
                value="analytics"
                icon={<AnalyticsIcon />}
                title="Аналитика"
              >
                <NavSubItem
                  as={Link}
                  href="/analytics/rating"
                  value="/analytics/rating"
                >
                  Рейтинг студентов
                </NavSubItem>
                <NavSubItem
                  as={Link}
                  href="/analytics/groups"
                  value="/analytics/groups"
                >
                  Успеваемость по группам
                </NavSubItem>
                <NavSubItem
                  as={Link}
                  href="/analytics/subjects"
                  value="/analytics/subjects"
                >
                  Успеваемость по дисциплинам
                </NavSubItem>
              </NavCategory>
            )}

            {(canSeeGroupSheet || canSeeStudentBook || canSeeGroupSummary) && (
              <NavCategory
                value="reports"
                icon={<ReportsIcon />}
                title="Отчёты"
              >
                {canSeeGroupSheet && (
                  <NavSubItem
                    as={Link}
                    href="/reports/group-sheet"
                    value="/reports/group-sheet"
                  >
                    Ведомость группы по дисциплине
                  </NavSubItem>
                )}
                {canSeeStudentBook && (
                  <NavSubItem
                    as={Link}
                    href="/reports/student-book"
                    value="/reports/student-book"
                  >
                    Зачётная книжка студента
                  </NavSubItem>
                )}
                {canSeeGroupSummary && (
                  <NavSubItem
                    as={Link}
                    href="/reports/group-summary"
                    value="/reports/group-summary"
                  >
                    Сводный отчёт по группе
                  </NavSubItem>
                )}
              </NavCategory>
            )}

            {canSeeAdmin && (
              <NavCategory
                value="admin"
                icon={<AdminIcon />}
                title="Администрирование"
              >
                {can("users.manage") && (
                  <NavSubItem
                    as={Link}
                    href="/admin/users"
                    value="/admin/users"
                  >
                    Пользователи
                  </NavSubItem>
                )}
                {can("roles.manage") && (
                  <NavSubItem
                    as={Link}
                    href="/admin/roles"
                    value="/admin/roles"
                  >
                    Роли и разрешения
                  </NavSubItem>
                )}
                {can("audit.read") && (
                  <NavSubItem
                    as={Link}
                    href="/admin/audit"
                    value="/admin/audit"
                  >
                    Журнал действий
                  </NavSubItem>
                )}
              </NavCategory>
            )}
          </>
        }
        footerMenuItems={
          <NavCategory
            value="settings"
            icon={<SettingsIcon />}
            title="Настройки"
          >
            <NavSubItem
              as={Link}
              href="/settings/account"
              value="/settings/account"
            >
              Учётная запись
            </NavSubItem>
            <NavSubItem
              as={Link}
              href="/settings/appearance"
              value="/settings/appearance"
            >
              Оформление
            </NavSubItem>
          </NavCategory>
        }
      >
        {children}
      </NavigationView>
    </div>
  );
}
