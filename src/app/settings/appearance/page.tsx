import { requireSession } from "@/server/auth/session";
import AppearancePageView from "./AppearancePageView";

export default async function AppearancePage() {
  await requireSession();
  return <AppearancePageView />;
}
