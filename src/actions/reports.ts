"use server";

import { prisma } from "@/server/lib";
import {
  buildGroupSheet,
  buildGroupSummary,
  buildStudentBook,
} from "@/server/reports";
import type { Report, ReportParams, ReportPath } from "@/models";
import { requireAnyPermission, requirePermission } from "@/server/auth/session";

export async function getReport(
  path: ReportPath,
  params: ReportParams,
): Promise<Report> {
  let scopedParams = params;
  if (path === "group-sheet") {
    await requirePermission("reports.group_sheet");
    return (await buildGroupSheet(prisma, params)) as Report;
  }
  if (path === "student-book") {
    const auth = await requireAnyPermission(["reports.student_book.all", "reports.student_book.own"]);
    if (
      auth.permissions.has("reports.student_book.own") &&
      !auth.permissions.has("reports.student_book.all")
    ) {
      if (!auth.studentId) throw new Error("Учётная запись не связана со студентом");
      scopedParams = { ...params, student_id: String(auth.studentId) };
    }
    return (await buildStudentBook(prisma, scopedParams)) as Report;
  }
  if (path === "group-summary") {
    await requirePermission("reports.group_summary");
    return (await buildGroupSummary(prisma, scopedParams)) as Report;
  }
  throw new Error("Неизвестный тип отчёта");
}
