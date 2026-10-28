import { getGroups } from "@/actions/groups";
import { getSemesters } from "@/actions/semesters";
import GroupSummaryPageView from "./GroupSummaryPageView";

export default async function GroupSummaryPage() {
  const [groups, semesters] = await Promise.all([getGroups(), getSemesters()]);

  return <GroupSummaryPageView groups={groups} semesters={semesters} />;
}
