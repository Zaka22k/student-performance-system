import { lazy } from "react";

export const GroupsPage = lazy(() => import("./groups"));
export const SemestersPage = lazy(() => import("./semesters"));
export const StudentsPage = lazy(() => import("./students"));
export const SubjectsPage = lazy(() => import("./subjects"));
export const TeachersPage = lazy(() => import("./teachers"));

export * from "./performance";
export * from "./session";
export * from "./analytics";
export * from "./reports";

export { NotFoundPage } from "./not-found";
