import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";
import {
  GroupsPage,
  StudentsPage,
  TeachersPage,
  SubjectsPage,
  SemestersPage,
  PerformancePage,
  EditPerformancePage,
  SchedulePage,
  SheetPage,
} from "@pages";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/performance" replace />} />

        <Route path="performance">
          <Route index element={<PerformancePage />} />
          <Route path="new" element={<EditPerformancePage />} />
          <Route path=":id/edit" element={<EditPerformancePage />} />
        </Route>

        <Route path="groups" element={<GroupsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="semesters" element={<SemestersPage />} />

        {/* Сессия */}
        <Route path="session">
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="sheet" element={<SheetPage />} />
        </Route>

        {/* Аналитика */}
        <Route path="analytics">
          <Route path="rating" />
          <Route path="groups" />
          <Route path="subjects" />
        </Route>

        {/* Отчёты */}
        <Route path="reports">
          <Route path="group-sheet" />
          <Route path="student-book" />
          <Route path="group-summary" />
        </Route>

        <Route path="*" />
      </Route>
    </Routes>
  );
}
