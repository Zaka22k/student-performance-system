// src/actions/reports.ts
"use server";

import { prisma } from "@/server";
import {
  buildGroupSheet,
  buildGroupSummary,
  buildStudentBook,
} from "@/server/reports";
import type { Report, ReportParams, ReportPath } from "@/models";

export async function getReport(
  path: ReportPath,
  params: ReportParams,
): Promise<Report> {
  if (path === "group-sheet") {
    return (await buildGroupSheet(prisma, params)) as Report;
  }
  if (path === "student-book") {
    return (await buildStudentBook(prisma, params)) as Report;
  }
  if (path === "group-summary") {
    return (await buildGroupSummary(prisma, params)) as Report;
  }
  throw new Error("Неизвестный тип отчёта");
}
