import { getSubjects } from "@/actions/subjects";
import SubjectsPageView from "./SubjectsPageView";

export default async function SubjectsPage() {
  const initialSubjects = await getSubjects("");

  return <SubjectsPageView initialSubjects={initialSubjects} />;
}
