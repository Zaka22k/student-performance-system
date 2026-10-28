import { getGroups } from "@/actions/groups";
import { getSemesters } from "@/actions/semesters";
import { getSchedule } from "@/actions/session";
import SchedulePageView from "./SchedulePageView";

export default async function SchedulePage() {
  const [groups, semesters] = await Promise.all([getGroups(), getSemesters()]);

  const initialSemesterId =
    semesters[0]?.semester_id !== undefined
      ? String(semesters[0].semester_id)
      : "";

  const initialRows = initialSemesterId
    ? await getSchedule({ semester_id: initialSemesterId })
    : [];

  return (
    <SchedulePageView
      groups={groups}
      semesters={semesters}
      initialSemesterId={initialSemesterId}
      initialRows={initialRows}
    />
  );
}
