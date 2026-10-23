import { lazy } from "react";

export const PerformancePage = lazy(() => import("./PerformancePage"));
export const EditPerformancePage = lazy(
  () => import("./edit/EditPerformancePage"),
);
