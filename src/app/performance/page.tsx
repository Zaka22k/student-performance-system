import { getPerformances } from "@/actions/performance";
import PerformancePageView from "./PerformancePageView";

export default async function PerformancePage() {
  const initialData = await getPerformances({ q: "" });

  return <PerformancePageView initialData={initialData} />;
}
