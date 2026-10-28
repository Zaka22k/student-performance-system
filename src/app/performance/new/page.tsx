import { getPerformanceOptions } from "@/actions/performance";
import EditPerformancePageView from "../_editPerformance";

export default async function NewPerformancePage() {
  const options = await getPerformanceOptions();

  return <EditPerformancePageView options={options} />;
}
