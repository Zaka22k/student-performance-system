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
  RatingPage,
  GroupsAnalyticsPage,
  SubjectsAnalyticsPage,
  GroupSheetPage,
  GroupSummaryPage,
  StudentBookPage,
  NotFoundPage,
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
          <Route path="rating" element={<RatingPage />} />
          <Route path="groups" element={<GroupsAnalyticsPage />} />
          <Route path="subjects" element={<SubjectsAnalyticsPage />} />
        </Route>

        {/* Отчёты */}
        <Route path="reports">
          <Route path="group-sheet" element={<GroupSheetPage />} />
          <Route path="student-book" element={<StudentBookPage />} />
          <Route path="group-summary" element={<GroupSummaryPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
