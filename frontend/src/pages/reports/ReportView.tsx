import type { Report } from "@models";
import styles from "./Reports.module.css";

interface Props {
  report: Report | null;
  loading: boolean;
  error: string | null;
}

// Результат отчёта: параметры, таблица и итоги
export default function ReportView({ report, loading, error }: Props) {
  if (error) return <div className={styles.error}>{error}</div>;
  if (loading) return <p className={`BodyTextBlockStyle ${styles.hint}`}>Формирование отчёта…</p>;
  if (!report) return <p className={`BodyTextBlockStyle ${styles.hint}`}>Выберите параметры и нажмите «Сформировать».</p>;

  // Столбцы только для печатной формы (подпись) на экране не нужны
  const columns = report.columns.filter((c) => !c.print_only);

  return (
    <section className={styles.report}>
      <h2 className={`BodyStrongTextBlockStyle ${styles.reportTitle}`}>{report.title}</h2>
      <dl className={styles.params}>
        {report.params.map((p) => (
          <div key={p.label} className={styles.paramRow}>
            <dt>{p.label}:</dt>
            <dd>{p.value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ textAlign: c.align }}>
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  Нет данных по выбранным параметрам
                </td>
              </tr>
            ) : (
              report.rows.map((row, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} style={{ textAlign: c.align }}>
                      {row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <dl className={styles.totals}>
        {report.totals.map((t) => (
          <div key={t.label} className={styles.paramRow}>
            <dt>{t.label}:</dt>
            <dd>{t.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
