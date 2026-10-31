import { getHomeSummary } from "@/server/home";
import HomePageView from "./_home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const summary = await getHomeSummary();
  return <HomePageView summary={summary} />;
}
