import { getGroups } from "@/actions/groups";
import { getSubjects } from "@/actions/subjects";
import { getSemesters } from "@/actions/semesters";
import GroupSheetPageView from "./GroupSheetPageView";

export default async function GroupSheetPage() {
  const [groups, subjects, semesters] = await Promise.all([
    getGroups(),
    getSubjects(),
    getSemesters(),
  ]);

  return (
    <GroupSheetPageView
      groups={groups}
      subjects={subjects}
      semesters={semesters}
    />
  );
}
