import { getTeachers } from "@/actions/teachers";
import TeachersPageView from "./TeachersPageView";

export default async function TeachersPage() {
  const initialTeachers = await getTeachers("");

  return <TeachersPageView initialTeachers={initialTeachers} />;
}
