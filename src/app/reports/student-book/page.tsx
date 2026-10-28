import { getStudents } from "@/actions/students";
import { getSemesters } from "@/actions/semesters";
import StudentBookPageView from "./StudentBookPageView";

export default async function StudentBookPage() {
  const [students, semesters] = await Promise.all([
    getStudents(),
    getSemesters(),
  ]);

  return <StudentBookPageView students={students} semesters={semesters} />;
}
