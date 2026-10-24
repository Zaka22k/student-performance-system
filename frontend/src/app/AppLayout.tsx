import { Suspense } from "react";
import { useLocation, useOutlet, Link } from "react-router-dom";
import { NavigationView, NavItem, NavCategory, NavSubItem } from "@components";
import {
  JournalIcon,
  DictionariesIcon,
  SessionIcon,
  AnalyticsIcon,
  ReportsIcon,
} from "@icons";

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

// Какую категорию раскрыть при загрузке страницы
const categoryFromSelected = (selected: string): string | undefined => {
  const first = selected.split("/")[1];
  if (CATEGORY_PREFIXES.includes(first)) return first;
  if (DICTIONARY_PAGES.includes(first)) return "dictionaries";
  return undefined;
};

export default function AppLayout() {
  const location = useLocation();
  const selected = selectedFromPath(location.pathname);
  const openCategory = categoryFromSelected(selected);
  const outlet = useOutlet();

  return (
    <div style={{ height: "100vh" }}>
      <NavigationView
        paneTitle="АСУ «Успеваемость»"
        selectedValue={selected}
        pageKey={location.pathname}
        defaultOpenCategories={openCategory ? [openCategory] : []}
        pageTransition={(info) =>
          info.relation === "peer" ? "entrance" : "slide"
        }
        menuItems={
          <>
            <NavItem
              as={Link}
              to="/performance"
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
              <NavSubItem as={Link} to="/groups" value="/groups">
                Группы
              </NavSubItem>
              <NavSubItem as={Link} to="/students" value="/students">
                Студенты
              </NavSubItem>
              <NavSubItem as={Link} to="/teachers" value="/teachers">
                Преподаватели
              </NavSubItem>
              <NavSubItem as={Link} to="/subjects" value="/subjects">
                Дисциплины
              </NavSubItem>
              <NavSubItem as={Link} to="/semesters" value="/semesters">
                Семестры
              </NavSubItem>
            </NavCategory>

            <NavCategory value="session" icon={<SessionIcon />} title="Сессия">
              <NavSubItem
                as={Link}
                to="/session/schedule"
                value="/session/schedule"
              >
                Расписание экзаменов и зачётов
              </NavSubItem>
              <NavSubItem as={Link} to="/session/sheet" value="/session/sheet">
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
                to="/analytics/rating"
                value="/analytics/rating"
              >
                Рейтинг студентов
              </NavSubItem>
              <NavSubItem
                as={Link}
                to="/analytics/groups"
                value="/analytics/groups"
              >
                Успеваемость по группам
              </NavSubItem>
              <NavSubItem
                as={Link}
                to="/analytics/subjects"
                value="/analytics/subjects"
              >
                Успеваемость по дисциплинам
              </NavSubItem>
            </NavCategory>

            <NavCategory value="reports" icon={<ReportsIcon />} title="Отчёты">
              <NavSubItem
                as={Link}
                to="/reports/group-sheet"
                value="/reports/group-sheet"
              >
                Ведомость группы по дисциплине
              </NavSubItem>
              <NavSubItem
                as={Link}
                to="/reports/student-book"
                value="/reports/student-book"
              >
                Зачётная книжка студента
              </NavSubItem>
              <NavSubItem
                as={Link}
                to="/reports/group-summary"
                value="/reports/group-summary"
              >
                Сводный отчёт по группе
              </NavSubItem>
            </NavCategory>
          </>
        }
      >
        <Suspense fallback={null}>{outlet}</Suspense>
      </NavigationView>
    </div>
  );
}
