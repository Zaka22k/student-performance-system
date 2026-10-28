import { getGroupsAnalytics } from "@/actions/analytics";
import { getSemesters } from "@/actions/semesters";
import GroupsAnalyticsPageView from "./GroupsAnalyticsPageView";

export default async function GroupsAnalyticsPage() {
  const [semesters, initialRows] = await Promise.all([
    getSemesters(),
    getGroupsAnalytics(undefined),
  ]);

  return (
    <GroupsAnalyticsPageView semesters={semesters} initialRows={initialRows} />
  );
}
