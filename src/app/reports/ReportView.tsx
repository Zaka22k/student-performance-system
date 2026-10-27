"use client";

import type { ReactNode } from "react";
import type { Report, ReportColumn } from "@/models";
import styles from "./Reports.module.css";

interface Props {
  report: Report | null;
  loading: boolean;
  error: string | null;
}

function renderReportCell(
  col: ReportColumn,
  raw: string | undefined,
): ReactNode {
  const val = raw ?? "";
  const lower = val.trim().toLowerCase();

  if (val === "—" || val === "-") {
    return <span className={styles.emptyValue}>{val}</span>;
  }

  // Колонка порядкового номера
  if (col.key === "num" || col.key === "index" || col.title === "№") {
    return <span className={styles.indexText}>{val}</span>;
  }

  // Колонка номера зачётки / студенческого билета
  if (col.key.includes("number")) {
    return (
      <span className={`CaptionTextBlockStyle ${styles.codeBadge}`}>{val}</span>
    );
  }

  // Автоматическая подсветка результатов и оценок
  if (
    lower === "5" ||
    lower === "отлично" ||
    lower === "зачтено" ||
    lower === "сдано" ||
    lower.startsWith("5 ")
  ) {
    return (
      <span
        className={`CaptionTextBlockStyle ${styles.resultPill} ${styles.toneSuccess}`}
      >
        {val}
      </span>
    );
  }
  if (lower === "4" || lower === "хорошо" || lower.startsWith("4 ")) {
    return (
      <span
        className={`CaptionTextBlockStyle ${styles.resultPill} ${styles.toneAccent}`}
      >
        {val}
      </span>
    );
  }
  if (
    lower === "3" ||
    lower === "удовлетворительно" ||
    lower === "удовл." ||
    lower.startsWith("3 ")
  ) {
    return (
      <span
        className={`CaptionTextBlockStyle ${styles.resultPill} ${styles.toneCaution}`}
      >
        {val}
      </span>
    );
  }
  if (
    lower === "2" ||
    lower === "неудовлетворительно" ||
    lower === "неудовл." ||
    lower === "не зачтено" ||
    lower === "не сдано" ||
    lower === "неявка" ||
    lower.startsWith("2 ")
  ) {
    return (
      <span
        className={`CaptionTextBlockStyle ${styles.resultPill} ${styles.toneCritical}`}
      >
        {val}
      </span>
    );
  }

  // ФИО студента или название дисциплины
  if (
    col.key.includes("name") ||
    col.key.includes("student") ||
    col.key.includes("subject")
  ) {
    return <span className="BodyStrongTextBlockStyle">{val}</span>;
  }

  return val;
}

// Результат отчёта: параметры, таблица и итоги
export default function ReportView({ report, loading, error }: Props) {
  if (error) return <div className={styles.error}>{error}</div>;
  if (loading) {
    return (
      <p className={`BodyTextBlockStyle ${styles.hint}`}>
        Формирование отчёта…
      </p>
    );
  }
  if (!report) {
    return (
      <p className={`BodyTextBlockStyle ${styles.hint}`}>
        Выберите параметры и нажмите «Сформировать».
      </p>
    );
  }

  // Столбцы только для печатной формы (подпись) на экране не нужны
  const columns = report.columns.filter((c) => !c.print_only);

  return (
    <section className={styles.report}>
      <h2 className={`SubtitleTextBlockStyle ${styles.reportTitle}`}>
        {report.title}
      </h2>

      <dl className={styles.params}>
        {report.params.map((p) => (
          <div key={p.label} className={styles.paramChip}>
            <dt className="CaptionTextBlockStyle">{p.label}:</dt>
            <dd className="BodyStrongTextBlockStyle">{p.value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.tableWrap}>
        <table className={`BodyTextBlockStyle ${styles.table}`}>
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
                      {renderReportCell(c, row[c.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {report.totals.length > 0 && (
        <dl className={styles.totals}>
          {report.totals.map((t) => (
            <div key={t.label} className={styles.totalChip}>
              <dt className="CaptionTextBlockStyle">{t.label}:</dt>
              <dd className="BodyStrongTextBlockStyle">{t.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
