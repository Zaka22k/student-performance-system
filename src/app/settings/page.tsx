import { requirePermission } from "@/server/auth/session";
import SettingsPageView from "./SettingsPageView";

export default async function SettingsPage() {
  await requirePermission("settings.use");
  return <SettingsPageView />;
}
