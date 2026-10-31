"use client";

import type { ReactNode } from "react";
import type { Report, ReportColumn } from "@/models";
import styles from "./Reports.module.css";

interface Props {
  report: Report | null;
  loading: boolean;
  error: string | null;
}

type ResultTone = "excellent" | "good" | "satisfactory" | "passed" | "fail";

// Тон результата по тексту ячейки. Применяется только к колонкам результата,
// иначе «Попытка» со значением 2 или 3 красилась бы как оценка
function getResultTone(raw: string): ResultTone | null {
  switch (raw.trim().toLowerCase()) {
    case "5":
    case "отлично":
      return "excellent";
    case "4":
    case "хорошо":
      return "good";
    case "3":
    case "удовлетворительно":
    case "удовл.":
      return "satisfactory";
    case "зачтено":
    case "сдано":
      return "passed";
    case "2":
    case "неудовлетворительно":
    case "неудовл.":
    case "не зачтено":
    case "не сдано":
    case "неявка":
      return "fail";
    default:
      return null;
  }
}

// Результат показывают колонка «Результат» и столбцы дисциплин в сводном отчёте (c<id>_<вид>)
const isResultColumn = (col: ReportColumn): boolean =>
  col.key === "result" || /^c\d+_/.test(col.key);

const isIndexColumn = (col: ReportColumn): boolean =>
  col.key === "no" || col.key === "num" || col.key === "index" || col.title === "№";

function renderReportCell(col: ReportColumn, raw: string | undefined): ReactNode {
  const val = raw ?? "";

  if (val === "" || val === "—" || val === "-") {
    return <span className={styles.muted}>{val || "—"}</span>;
  }

  if (isIndexColumn(col) || col.key.includes("number")) {
    return <span className={styles.muted}>{val}</span>;
  }

  if (isResultColumn(col)) {
    const tone = getResultTone(val);
    if (tone) {
      return <span className={`${styles.result} ${styles[`result_${tone}`]}`}>{val}</span>;
    }
  }

  // Имя студента и название дисциплины, а также средний балл в сводке
  if (col.key === "student" || col.key === "subject" || col.key === "avg") {
    return (
      <span className={`BodyTextBlockStyle BodyStrongTextBlockStyle ${styles.name}`}>
        {val}
      </span>
    );
  }

  return val;
}

// 2026-10-20 19:09 → 20.10.2026 19:09
function formatGenerated(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2})/.exec(value);
  return match ? `${match[3]}.${match[2]}.${match[1]} ${match[4]}` : value;
}

// Результат отчёта: параметры, таблица и итоги
export default function ReportView({ report, loading, error }: Props) {
  if (error) {
    return (
      <div className={styles.error} role="alert">
        {error}
      </div>
    );
  }
  if (loading) {
    return (
      <p className={`BodyTextBlockStyle ${styles.placeholder}`} role="status">
        Формирование отчёта…
      </p>
    );
  }
  if (!report) {
    return (
      <div className={styles.placeholder}>
        <span className="BodyStrongTextBlockStyle">Отчёта пока нет</span>
        <span className="BodyTextBlockStyle">
          Выберите параметры и нажмите «Сформировать».
        </span>
      </div>
    );
  }

  // Столбцы только для печатной формы (подпись) на экране не нужны
  const columns = report.columns.filter((c) => !c.print_only);

  return (
    <section className={styles.report}>
      <header className={styles.reportHeader}>
        <h2 className={`SubtitleTextBlockStyle ${styles.reportTitle}`}>
          {report.title}
        </h2>
        <dl className={styles.params}>
          {report.params.map((p) => (
            <div key={p.label} className={styles.param}>
              <dt className="CaptionTextBlockStyle">{p.label}</dt>
              <dd className="BodyTextBlockStyle BodyStrongTextBlockStyle">{p.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className={styles.card}>
        <div className={styles.tableWrap}>
          <table className={`BodyTextBlockStyle ${styles.table}`}>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="CaptionTextBlockStyle"
                    style={{ textAlign: c.align }}
                  >
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

        <footer className={styles.summary}>
          <dl className={styles.totals}>
            {report.totals.map((t) => (
              <div key={t.label} className={styles.total}>
                <dt className="CaptionTextBlockStyle">{t.label}</dt>
                <dd className="BodyTextBlockStyle BodyStrongTextBlockStyle">{t.value}</dd>
              </div>
            ))}
          </dl>
          <span className={`CaptionTextBlockStyle ${styles.generated}`}>
            Сформировано {formatGenerated(report.generated_at)}
          </span>
        </footer>
      </div>
    </section>
  );
}
