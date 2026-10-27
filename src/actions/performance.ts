"use server";

import { prisma, buildSearchWhere, withActionError } from "@/server/lib";
import { performanceInputSchema } from "@/schemas";
import type {
  Performance,
  PerformanceInput,
  PerformanceListResponse,
  PerformanceOptions,
} from "@/models";
import { getStudents } from "./students";
import { getSubjects } from "./subjects";
import { getTeachers } from "./teachers";
import { getSemesters } from "./semesters";

const DEFAULT_LIMIT = 50;

const INCLUDE = {
  students: { include: { student_groups: true } },
  subjects: true,
  teachers: true,
  semesters: true,
} as const;

const SEARCH = {
  textFields: [
    "students.last_name",
    "students.first_name",
    "students.middle_name",
    "students.student_number",
    "students.student_groups.group_code",
    "subjects.subject_name",
    "subjects.subject_code",
    "teachers.last_name",
    "teachers.first_name",
  ],
};

const MESSAGES = {
  notFound: "Запись успеваемости не найдена",
  unique:
    "Такая запись уже есть: студент, дисциплина, семестр, вид контроля и номер попытки совпадают",
  foreignKey:
    "Указаны несуществующие студент, дисциплина, преподаватель или семестр",
};

const parsePerformanceId = (id: string): bigint => {
  const str = String(id ?? "").trim();
  if (!/^\d+$/.test(str)) {
    throw new Error(MESSAGES.notFound);
  }
  return BigInt(str);
};

const fullName = (p: {
  last_name: string;
  first_name: string;
  middle_name?: string | null;
}) => [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");

const toDto = (row: any): Performance => ({
  performance_id: String(row.performance_id),
  student_id: String(row.student_id),
  student_number: row.students.student_number,
  student_name: fullName(row.students),
  group_code: row.students.student_groups.group_code,
  subject_id: String(row.subject_id),
  subject_name: row.subjects.subject_name,
  teacher_id: String(row.teacher_id),
  teacher_name: fullName(row.teachers),
  semester_id: String(row.semester_id),
  academic_year_start: row.semesters.academic_year_start,
  term_number: row.semesters.term_number,
  assessment_type: row.assessment_type,
  grade: row.grade,
  passed: row.passed,
  attempt_number: row.attempt_number,
  assessment_date: row.assessment_date.toISOString().slice(0, 10),
});

const encodeCursor = (row: any) =>
  Buffer.from(
    `${row.assessment_date.toISOString().slice(0, 10)}|${row.performance_id}`,
  ).toString("base64url");

const decodeCursor = (cursor: string) => {
  const [date, id] = Buffer.from(cursor, "base64url").toString().split("|");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "") || !/^\d+$/.test(id ?? ""))
    return null;
  return { date: new Date(date), id: BigInt(id) };
};

export async function getPerformances(params?: {
  q?: string;
  cursor?: string | null;
  limit?: number;
}): Promise<PerformanceListResponse> {
  const q = params?.q;
  const cursor = params?.cursor;
  const limit = Math.min(Math.max(params?.limit ?? DEFAULT_LIMIT, 1), 100);

  const conditions: any[] = [buildSearchWhere(q, SEARCH)];

  if (cursor) {
    const c = decodeCursor(cursor);
    if (!c) throw new Error("Неверный курсор");
    conditions.push({
      OR: [
        { assessment_date: { lt: c.date } },
        { assessment_date: c.date, performance_id: { lt: c.id } },
      ],
    });
  }

  const rows = await prisma.student_performance.findMany({
    where: { AND: conditions.filter(Boolean) },
    orderBy: [{ assessment_date: "desc" }, { performance_id: "desc" }],
    take: limit + 1,
    include: INCLUDE,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: page.map(toDto),
    nextCursor: hasMore ? encodeCursor(page[page.length - 1]) : null,
  };
}

export async function getPerformance(id: string): Promise<Performance> {
  return withActionError(
    async () => {
      const row = await prisma.student_performance.findUnique({
        where: { performance_id: parsePerformanceId(id) },
        include: INCLUDE,
      });
      if (!row) throw new Error(MESSAGES.notFound);
      return toDto(row);
    },
    MESSAGES,
    "read",
  );
}

export async function createPerformance(
  rawInput: PerformanceInput,
): Promise<Performance> {
  return withActionError(
    async () => {
      const data = performanceInputSchema.parse(rawInput);
      const row = await prisma.student_performance.create({
        data,
        include: INCLUDE,
      });
      return toDto(row);
    },
    MESSAGES,
    "create",
  );
}

export async function updatePerformance(
  id: string,
  rawInput: PerformanceInput,
): Promise<Performance> {
  return withActionError(
    async () => {
      const data = performanceInputSchema.parse(rawInput);
      const row = await prisma.student_performance.update({
        where: { performance_id: parsePerformanceId(id) },
        data,
        include: INCLUDE,
      });
      return toDto(row);
    },
    MESSAGES,
    "update",
  );
}

export async function deletePerformance(id: string): Promise<void> {
  return withActionError(
    async () => {
      await prisma.student_performance.delete({
        where: { performance_id: parsePerformanceId(id) },
      });
    },
    MESSAGES,
    "delete",
  );
}

export async function getPerformanceOptions(): Promise<PerformanceOptions> {
  const [students, subjects, teachers, semesters] = await Promise.all([
    getStudents(),
    getSubjects(),
    getTeachers(),
    getSemesters(),
  ]);
  return { students, subjects, teachers, semesters };
}
