// src/server/reportXml.ts
import type { Report } from "../models";

// eslint-disable-next-line no-control-regex
const INVALID = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;

export const escapeXml = (value: unknown): string =>
  String(value ?? "")
    .replace(INVALID, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function toXml(report: Report, stylesheetHref = "report.xsl"): string {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<?xml-stylesheet type="text/xsl" href="${escapeXml(stylesheetHref)}"?>`,
    `<report type="${escapeXml(report.type)}" orientation="${escapeXml(report.orientation)}" generated="${escapeXml(report.generated_at)}">`,
    `  <title>${escapeXml(report.title)}</title>`,
    `  <parameters>`,
    ...report.params.map(
      (p) =>
        `    <parameter name="${escapeXml(p.label)}">${escapeXml(p.value)}</parameter>`,
    ),
    `  </parameters>`,
    `  <columns>`,
    ...report.columns.map(
      (c) =>
        `    <column key="${escapeXml(c.key)}" align="${escapeXml(c.align ?? "left")}"${c.print_only ? ` printOnly="true"` : ""}>${escapeXml(c.title)}</column>`,
    ),
    `  </columns>`,
    `  <rows>`,
    ...report.rows.map((row) =>
      [
        `    <row>`,
        ...report.columns.map(
          (c) =>
            `      <cell key="${escapeXml(c.key)}">${escapeXml(row[c.key])}</cell>`,
        ),
        `    </row>`,
      ].join("\n"),
    ),
    `  </rows>`,
    `  <totals>`,
    ...report.totals.map(
      (t) =>
        `    <total label="${escapeXml(t.label)}">${escapeXml(t.value)}</total>`,
    ),
    `  </totals>`,
    `  <signatures>`,
    ...(report.signatures ?? []).map(
      (s) =>
        `    <signature label="${escapeXml(s.label)}">${escapeXml(s.name)}</signature>`,
    ),
    `  </signatures>`,
    `</report>`,
  ];
  return lines.join("\n") + "\n";
}
