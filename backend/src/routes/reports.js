import { readFile } from "node:fs/promises";
import { ASSESSMENT_TYPES, buildGroupSheet, buildGroupSummary, buildStudentBook } from "../lib/reports.js";
import { toXml } from "../lib/reportXml.js";
import { toHtml } from "../lib/reportHtml.js";

const ID = { type: "string", pattern: "^[0-9]+$" };

// Общие параметры вывода:
//   format=json (по умолчанию) | xml | html
//   download=1  - XML отдаётся файлом, а не показывается в браузере
//   print=1     - HTML сразу открывает окно печати
//   pdf=1       - HTML с подсказкой «Сохранить как PDF» (и окном печати)
const OUTPUT = {
  format: { type: "string", enum: ["json", "xml", "html"], default: "json" },
  download: { type: "string", enum: ["0", "1"] },
  print: { type: "string", enum: ["0", "1"] },
  pdf: { type: "string", enum: ["0", "1"] },
};

const XSL_URL = new URL("../reports/report.xsl", import.meta.url);

export default async function reportsRoutes(app) {
  // Описание отчёта: required - обязательные параметры, builder - построитель
  const reports = [
    {
      path: "/group-sheet",
      builder: buildGroupSheet,
      required: ["group_id", "subject_id", "semester_id", "assessment_type"],
      properties: {
        group_id: ID,
        subject_id: ID,
        semester_id: ID,
        assessment_type: { type: "string", enum: ASSESSMENT_TYPES },
      },
    },
    {
      path: "/student-book",
      builder: buildStudentBook,
      required: ["student_id"],
      properties: { student_id: ID, semester_id: ID },
    },
    {
      path: "/group-summary",
      builder: buildGroupSummary,
      required: ["group_id", "semester_id"],
      properties: { group_id: ID, semester_id: ID },
    },
  ];

  for (const { path, builder, required, properties } of reports) {
    app.get(
      path,
      {
        schema: {
          querystring: {
            type: "object",
            required,
            additionalProperties: false,
            properties: { ...properties, ...OUTPUT },
          },
        },
      },
      async (request, reply) => {
        const report = await builder(app.prisma, request.query);
        const q = request.query;

        if (q.format === "xml") {
          reply.type("application/xml; charset=utf-8");
          if (q.download === "1") {
            reply.header("Content-Disposition", `attachment; filename="${report.type}.xml"`);
          }
          // report.xsl лежит рядом: /api/reports/report.xsl
          return toXml(report, "report.xsl");
        }

        if (q.format === "html") {
          reply.type("text/html; charset=utf-8");
          return toHtml(report, { autoprint: q.print === "1" || q.pdf === "1", pdf: q.pdf === "1" });
        }

        return report;
      },
    );
  }

  // Преобразование XML → HTML (применяется браузером к XML-экспорту)
  app.get("/report.xsl", async (request, reply) => {
    reply.type("text/xsl; charset=utf-8");
    return readFile(XSL_URL, "utf8");
  });
}
