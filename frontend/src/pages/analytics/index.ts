import { lazy } from "react";

export const GroupsAnalyticsPage = lazy(
  () => import("./groups/GroupsAnalyticsPage"),
);
export const RatingPage = lazy(() => import("./rating/RatingPage"));
export const SubjectsAnalyticsPage = lazy(
  () => import("./subjects/SubjectsAnalyticsPage"),
);
