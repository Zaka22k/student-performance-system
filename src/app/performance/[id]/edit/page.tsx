import { getPerformance, getPerformanceOptions } from "@/actions/performance";
import EditPerformancePageView from "../../_editPerformance";

interface PageProps {
  params: Promise<{ id?: string }>;
}

export default async function EditPerformancePage({ params }: PageProps) {
  const { id } = await params;

  const [options, record] = await Promise.all([
    getPerformanceOptions(),
    id ? getPerformance(id) : Promise.resolve(undefined),
  ]);

  return (
    <EditPerformancePageView
      key={id ?? "new"}
      id={id}
      options={options}
      record={record}
    />
  );
}
