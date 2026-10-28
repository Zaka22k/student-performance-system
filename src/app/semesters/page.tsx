import { getSemesters } from "@/actions/semesters";
import SemestersPageView from "./SemestersPageView";

export default async function SemestersPage() {
  const initialSemesters = await getSemesters("");

  return <SemestersPageView initialSemesters={initialSemesters} />;
}
