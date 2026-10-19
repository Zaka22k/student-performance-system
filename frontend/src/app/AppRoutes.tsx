import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";
import {
  GroupsPage,
  StudentsPage,
  TeachersPage,
  SubjectsPage,
  SemestersPage,
} from "@pages";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/performance" replace />} />

        <Route path="performance">
          <Route index />
          <Route path="new" />
          <Route path=":id" />
          <Route path=":id/edit" />
        </Route>

        <Route path="groups" element={<GroupsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="semesters" element={<SemestersPage />} />

        {/* Сессия */}
        <Route path="session">
          <Route path="schedule" />
          <Route path="sheet" />
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
