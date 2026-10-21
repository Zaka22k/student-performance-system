// Печатная форма отчёта: самостоятельная HTML-страница формата A4.
// Из неё же получается PDF: браузер сохраняет страницу через «Печать → Сохранить как PDF»,
// шрифты и кириллица при этом берутся из системы пользователя.

import { escapeXml as esc } from "./reportXml.js";

const CSS = (orientation) => `
  @page { size: A4 ${orientation}; margin: 15mm 12mm; }
  * { box-sizing: border-box; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color: #000; margin: 0; background: #fff; }
  .sheet { max-width: ${orientation === "landscape" ? "277mm" : "186mm"}; margin: 0 auto; padding: 16px; }
  .hint { font-family: system-ui, sans-serif; font-size: 13px; background: #fff7d6; border: 1px solid #e6c84d;
          border-radius: 6px; padding: 10px 12px; margin-bottom: 16px; }
  .hint button { font: inherit; margin-left: 8px; cursor: pointer; }
  h1 { font-size: 16pt; text-align: center; margin: 0 0 10px; }
  dl { margin: 0 0 12px; }
  dl div { display: flex; gap: 6px; }
  dt { font-weight: bold; }
  dd { margin: 0; }
  table { border-collapse: collapse; width: 100%; font-size: 10.5pt; }
  th, td { border: 1px solid #000; padding: 3px 5px; vertical-align: top; }
  th { background: #eee; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  .left { text-align: left; } .center { text-align: center; } .right { text-align: right; }
  td.signature { min-width: 35mm; }
  .totals { margin-top: 10px; font-size: 11pt; }
  .sign { margin-top: 26px; font-size: 11pt; page-break-inside: avoid; }
  .sign div { margin-top: 14px; }
  .meta { margin-top: 18px; font-size: 9pt; color: #555; }
  @media print { .hint { display: none; } .sheet { padding: 0; max-width: none; } }
`;

// options.autoprint: открыть диалог печати сразу после загрузки
// options.pdf: показать подсказку про «Сохранить как PDF»
export function toHtml(report, options = {}) {
  const { autoprint = false, pdf = false } = options;

  const head = report.columns
    .map((c) => `<th class="${esc(c.align ?? "left")}">${esc(c.title)}</th>`)
    .join("");

  const body = report.rows
    .map(
      (row) =>
        `<tr>${report.columns
          .map(
            (c) =>
              `<td class="${esc(c.align ?? "left")}${c.key === "signature" ? " signature" : ""}">${esc(row[c.key])}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("\n");

  const empty = report.rows.length === 0
    ? `<tr><td class="center" colspan="${report.columns.length}">Нет данных по выбранным параметрам</td></tr>`
    : "";

  const hint = pdf
    ? `<div class="hint">Чтобы сохранить PDF, в окне печати выберите принтер «Сохранить как PDF».
         <button type="button" onclick="window.print()">Открыть окно печати</button></div>`
    : `<div class="hint"><button type="button" onclick="window.print()">Печать</button></div>`;

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(report.title)}</title>
<style>${CSS(report.orientation === "landscape" ? "landscape" : "portrait")}</style>
</head>
<body>
<div class="sheet">
${hint}
<h1>${esc(report.title)}</h1>
<dl>
${report.params.map((p) => `<div><dt>${esc(p.label)}:</dt><dd>${esc(p.value)}</dd></div>`).join("\n")}
</dl>
<table>
<thead><tr>${head}</tr></thead>
<tbody>
${body}${empty}
</tbody>
</table>
<div class="totals">
${report.totals.map((t) => `<div><b>${esc(t.label)}:</b> ${esc(t.value)}</div>`).join("\n")}
</div>
<div class="sign">
${(report.signatures ?? [])
  .map(
    (s) =>
      `<div>${esc(s.label)}: ______________________${s.name ? ` / ${esc(s.name)} /` : ""}</div>`,
  )
  .join("\n")}
</div>
<div class="meta">Сформировано: ${esc(report.generated_at)}</div>
</div>
${autoprint ? `<script>window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 200); });</script>` : ""}
</body>
</html>
`;
}
