import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/lib";
import {
  buildGroupSheet,
  buildGroupSummary,
  buildStudentBook,
  toXml,
  toHtml,
} from "@/server";
import type { Report, ReportParams, ReportPath } from "@/models";

const BUILDERS: Record<
  ReportPath,
  (prisma: any, query: ReportParams) => Promise<Report>
> = {
  "group-sheet": buildGroupSheet as any,
  "student-book": buildStudentBook as any,
  "group-summary": buildGroupSummary as any,
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string }> },
) {
  const { type } = await context.params;
  const builder = BUILDERS[type as ReportPath];
  if (!builder) {
    return NextResponse.json({ message: "Отчёт не найден" }, { status: 404 });
  }

  const query = Object.fromEntries(request.nextUrl.searchParams.entries());

  try {
    const report = await builder(prisma, query);

    if (query.format === "xml") {
      const headers: Record<string, string> = {
        "Content-Type": "application/xml; charset=utf-8",
      };
      if (query.download === "1") {
        headers["Content-Disposition"] =
          `attachment; filename="${report.type}.xml"`;
      }
      return new NextResponse(toXml(report, "/report.xsl"), { headers });
    }

    if (query.format === "html") {
      return new NextResponse(
        toHtml(report, { autoprint: query.print === "1" }),
        {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        },
      );
    }

    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message ?? "Ошибка формирования отчёта" },
      { status: error?.statusCode ?? 500 },
    );
  }
}
