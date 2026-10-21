import { http } from "@api";
import type { Group, Report, ReportParams, ReportPath, Semester, Student, Subject } from "@models";

export const getReport = (path: ReportPath, params: ReportParams, signal?: AbortSignal) =>
  http.get<Report>(`/reports/${path}`, { params, signal }).then((r) => r.data);

// Вид вывода отчёта, который открывается в новой вкладке
export type ReportOutput = "print" | "pdf" | "xml" | "xml-file";

const OUTPUT_PARAMS: Record<ReportOutput, Record<string, string>> = {
  print: { format: "html", print: "1" }, // печатная форма, окно печати открывается само
  pdf: { format: "html", pdf: "1" }, // та же форма с подсказкой «Сохранить как PDF»
  xml: { format: "xml" }, // XML, который браузер показывает через report.xsl
  "xml-file": { format: "xml", download: "1" }, // XML файлом
};

// Адрес вывода отчёта с теми параметрами, по которым он построен
export const getReportUrl = (path: ReportPath, params: ReportParams, output: ReportOutput) =>
  http.getUri({ url: `/reports/${path}`, params: { ...params, ...OUTPUT_PARAMS[output] } });

// Справочники для параметров отчётов
export const getReportOptions = async () => {
  const [groups, students, subjects, semesters] = await Promise.all([
    http.get<Group[]>("/groups").then((r) => r.data),
    http.get<Student[]>("/students").then((r) => r.data),
    http.get<Subject[]>("/subjects").then((r) => r.data),
    http.get<Semester[]>("/semesters").then((r) => r.data),
  ]);
  return { groups, students, subjects, semesters };
};

export type ReportOptions = Awaited<ReturnType<typeof getReportOptions>>;
