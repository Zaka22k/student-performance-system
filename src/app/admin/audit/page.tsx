import { getAuditLogs } from "@/actions/access-control";
import AuditPageView from "./AuditPageView";

export default async function AdminAuditPage() {
  const rows = await getAuditLogs(200);
  return <AuditPageView initialRows={rows} />;
}
