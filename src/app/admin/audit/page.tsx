import { getAuditLogs } from "@/actions/access-control";

export default async function AdminAuditPage() {
  const rows = await getAuditLogs(150);
  return (
    <main style={{ padding: 24, display: "grid", gap: 16 }}>
      <header>
        <h1>Журнал действий</h1>
        <p>События входа, изменения учётных записей и настройки разрешений.</p>
      </header>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead><tr>
            <th style={{ textAlign: "left", padding: 10 }}>Дата</th>
            <th style={{ textAlign: "left", padding: 10 }}>Пользователь</th>
            <th style={{ textAlign: "left", padding: 10 }}>Действие</th>
            <th style={{ textAlign: "left", padding: 10 }}>Объект</th>
            <th style={{ textAlign: "left", padding: 10 }}>Детали</th>
          </tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.audit_id} style={{ borderTop: "1px solid var(--border, #ddd)" }}>
                <td style={{ padding: 10, whiteSpace: "nowrap" }}>{new Date(row.created_at).toLocaleString("ru-RU")}</td>
                <td style={{ padding: 10 }}>{row.actor}</td>
                <td style={{ padding: 10 }}>{row.action}</td>
                <td style={{ padding: 10 }}>{row.target_type ?? "—"} {row.target_id ?? ""}</td>
                <td style={{ padding: 10, maxWidth: 320, overflowWrap: "anywhere" }}>
                  {row.details ? JSON.stringify(row.details) : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} style={{ padding: 12 }}>Событий пока нет</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  );
}
