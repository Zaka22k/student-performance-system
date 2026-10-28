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
import {
  JournalIcon,
  DictionariesIcon,
  SessionIcon,
  AnalyticsIcon,
  ReportsIcon,
  SettingsIcon,
} from "@/icons";

const CATEGORY_PREFIXES = ["session", "analytics", "reports"];
const DICTIONARY_PAGES = [
  "groups",
  "students",
  "teachers",
  "subjects",
  "semesters",
];

const selectedFromPath = (pathname: string): string => {
  const [first, second] = pathname.split("/").filter(Boolean);
  if (!first) return "/performance";
  if (CATEGORY_PREFIXES.includes(first) && second) return `/${first}/${second}`;
  return `/${first}`;
};

const categoryFromSelected = (selected: string): string | undefined => {
  const first = selected.split("/")[1];
  if (CATEGORY_PREFIXES.includes(first)) return first;
  if (DICTIONARY_PAGES.includes(first)) return "dictionaries";
  return undefined;
};

export default function AppLayout({ children }: { children: ReactNode }) {
  useOnlineStatus();
  const pathname = usePathname();
  const selected = selectedFromPath(pathname);
  const openCategory = categoryFromSelected(selected);

  return (
    <div style={{ height: "100vh" }}>
      <NavigationView
        paneTitle="АСУ «Успеваемость»"
        selectedValue={selected}
        pageKey={pathname}
        defaultOpenCategories={openCategory ? [openCategory] : []}
        pageTransition={(info) =>
          info.relation === "peer" ? "entrance" : "slide"
        }
        menuItems={
          <>
            <NavItem
              as={Link}
              href="/performance"
              value="/performance"
              icon={<JournalIcon />}
            >
              Журнал успеваемости
            </NavItem>

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

            <NavCategory value="session" icon={<SessionIcon />} title="Сессия">
              <NavSubItem
                as={Link}
                href="/session/schedule"
                value="/session/schedule"
              >
                Расписание экзаменов и зачётов
              </NavSubItem>
              <NavSubItem
                as={Link}
                href="/session/sheet"
                value="/session/sheet"
              >
                Формирование ведомости группы
              </NavSubItem>
            </NavCategory>

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

            <NavCategory value="reports" icon={<ReportsIcon />} title="Отчёты">
              <NavSubItem
                as={Link}
                href="/reports/group-sheet"
                value="/reports/group-sheet"
              >
                Ведомость группы по дисциплине
              </NavSubItem>
              <NavSubItem
                as={Link}
                href="/reports/student-book"
                value="/reports/student-book"
              >
                Зачётная книжка студента
              </NavSubItem>
              <NavSubItem
                as={Link}
                href="/reports/group-summary"
                value="/reports/group-summary"
              >
                Сводный отчёт по группе
              </NavSubItem>
            </NavCategory>
          </>
        }
        footerMenuItems={
          <NavItem
            icon={<SettingsIcon />}
            as={Link}
            href="/settings"
            value="/settings"
          >
            Настройки
          </NavItem>
        }
      >
        {children}
      </NavigationView>
    </div>
  );
}
