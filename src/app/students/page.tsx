import { getStudents } from "@/actions/students";
import { getGroups } from "@/actions/groups";
import StudentsPageView from "./StudentsPageView";

export default async function StudentsPage() {
  const [initialStudents, groups] = await Promise.all([
    getStudents(""),
    getGroups(),
  ]);

  return <StudentsPageView initialStudents={initialStudents} groups={groups} />;
}
