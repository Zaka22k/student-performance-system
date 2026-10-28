import { getSubjectsAnalytics } from "@/actions/analytics";
import { getSemesters } from "@/actions/semesters";
import { getGroups } from "@/actions/groups";
import SubjectsAnalyticsPageView from "./SubjectsAnalyticsPageView";

export default async function SubjectsAnalyticsPage() {
  const [semesters, groups, initialStats] = await Promise.all([
    getSemesters(),
    getGroups(),
    getSubjectsAnalytics({}),
  ]);

  return (
    <SubjectsAnalyticsPageView
      semesters={semesters}
      groups={groups}
      initialRows={initialStats.rows}
      initialDistribution={initialStats.distribution}
    />
  );
}
