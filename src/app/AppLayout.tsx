"use client";

import { type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  NavigationView,
  NavItem,
  NavCategory,
  NavSubItem,
} from "@ui-kit/components";
import { logout } from "@/actions/auth";
import { useOnlineStatus } from "@/hooks";
import {
  JournalIcon,
  DictionariesIcon,
  SessionIcon,
  AnalyticsIcon,
  ReportsIcon,
  SettingsIcon,
  HomeIcon,
} from "@/icons";

type AuthView = {
  username: string;
  roleCode: string;
  permissions: string[];
};

const CATEGORY_PREFIXES = ["session", "analytics", "reports", "admin"];
const DICTIONARY_PAGES = ["groups", "students", "teachers", "subjects", "semesters"];

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
  const router = useRouter();
  const pathname = usePathname();

  if (!currentUser) return <>{children}</>;

  const permissions = new Set(currentUser.permissions);
  const can = (...codes: string[]) => codes.some((code) => permissions.has(code));
  const selected = selectedFromPath(pathname);
  const openCategory = categoryFromSelected(selected);
  const canSeeSchedule = can("session.schedule.read.all", "session.schedule.read.own");
  const canFormSheet = can("session.sheet.form");
  const canSeeGroupSheet = can("reports.group_sheet");
  const canSeeStudentBook = can("reports.student_book.all", "reports.student_book.own");
  const canSeeGroupSummary = can("reports.group_summary");
  const canSeeDictionaries = can("dictionaries.read");
  const canSeeAdmin = can("users.manage", "roles.manage");

  async function signOut() {
    await logout();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div style={{ height: "100vh" }}>
      <NavigationView
        paneTitle="АСУ «Успеваемость»"
        extendContentUnderPane
        selectedValue={selected}
        pageKey={pathname}
        defaultOpenCategories={openCategory ? [openCategory] : []}
        pageTransition={(info) => info.relation === "peer" ? "entrance" : "slide"}
        menuItems={
          <>
            {can("home.view") && (
              <NavItem as={Link} href="/" value="home" icon={<HomeIcon />}>
                Главная
              </NavItem>
            )}

            {can("grades.read.all", "grades.read.own") && (
              <NavItem as={Link} href="/performance" value="/performance" icon={<JournalIcon />}>
                Журнал успеваемости
              </NavItem>
            )}

            {canSeeDictionaries && (
              <NavCategory value="dictionaries" icon={<DictionariesIcon />} title="Справочники">
                <NavSubItem as={Link} href="/groups" value="/groups">Группы</NavSubItem>
                <NavSubItem as={Link} href="/students" value="/students">Студенты</NavSubItem>
                <NavSubItem as={Link} href="/teachers" value="/teachers">Преподаватели</NavSubItem>
                <NavSubItem as={Link} href="/subjects" value="/subjects">Дисциплины</NavSubItem>
                <NavSubItem as={Link} href="/semesters" value="/semesters">Семестры</NavSubItem>
              </NavCategory>
            )}

            {(canSeeSchedule || canFormSheet) && (
              <NavCategory value="session" icon={<SessionIcon />} title="Сессия">
                {canSeeSchedule && (
                  <NavSubItem as={Link} href="/session/schedule" value="/session/schedule">
                    Расписание экзаменов и зачётов
                  </NavSubItem>
                )}
                {canFormSheet && (
                  <NavSubItem as={Link} href="/session/sheet" value="/session/sheet">
                    Формирование ведомости группы
                  </NavSubItem>
                )}
              </NavCategory>
            )}

            {can("analytics.read") && (
              <NavCategory value="analytics" icon={<AnalyticsIcon />} title="Аналитика">
                <NavSubItem as={Link} href="/analytics/rating" value="/analytics/rating">Рейтинг студентов</NavSubItem>
                <NavSubItem as={Link} href="/analytics/groups" value="/analytics/groups">Успеваемость по группам</NavSubItem>
                <NavSubItem as={Link} href="/analytics/subjects" value="/analytics/subjects">Успеваемость по дисциплинам</NavSubItem>
              </NavCategory>
            )}

            {(canSeeGroupSheet || canSeeStudentBook || canSeeGroupSummary) && (
              <NavCategory value="reports" icon={<ReportsIcon />} title="Отчёты">
                {canSeeGroupSheet && (
                  <NavSubItem as={Link} href="/reports/group-sheet" value="/reports/group-sheet">Ведомость группы по дисциплине</NavSubItem>
                )}
                {canSeeStudentBook && (
                  <NavSubItem as={Link} href="/reports/student-book" value="/reports/student-book">Зачётная книжка студента</NavSubItem>
                )}
                {canSeeGroupSummary && (
                  <NavSubItem as={Link} href="/reports/group-summary" value="/reports/group-summary">Сводный отчёт по группе</NavSubItem>
                )}
              </NavCategory>
            )}

            {canSeeAdmin && (
              <NavCategory value="admin" icon={<SettingsIcon />} title="Администрирование">
                {can("users.manage") && (
                  <NavSubItem as={Link} href="/admin/users" value="/admin/users">Пользователи</NavSubItem>
                )}
                {can("roles.manage") && (
                  <NavSubItem as={Link} href="/admin/roles" value="/admin/roles">Роли и разрешения</NavSubItem>
                )}
              </NavCategory>
            )}
          </>
        }
        footerMenuItems={
          <>
            {can("settings.use") && (
              <NavItem icon={<SettingsIcon />} as={Link} href="/settings" value="/settings">
                Настройки
              </NavItem>
            )}
            <div style={{ padding: "12px 16px", display: "grid", gap: 8 }}>
              <span style={{ fontSize: 13, opacity: 0.75 }}>
                {currentUser.username} · {currentUser.roleCode}
              </span>
              <button type="button" onClick={signOut}>Выйти</button>
            </div>
          </>
        }
      >
        {children}
      </NavigationView>
    </div>
  );
}
