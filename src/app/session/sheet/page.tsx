import { getGroups } from "@/actions/groups";
import { getStudents } from "@/actions/students";
import { getSubjects } from "@/actions/subjects";
import { getTeachers } from "@/actions/teachers";
import { getSemesters } from "@/actions/semesters";
import SheetPageView from "./SheetPageView";

export default async function SheetPage() {
  const [groups, students, subjects, teachers, semesters] = await Promise.all([
    getGroups(),
    getStudents(),
    getSubjects(),
    getTeachers(),
    getSemesters(),
  ]);

  return (
    <SheetPageView
      options={{ groups, students, subjects, teachers, semesters }}
    />
  );
}
