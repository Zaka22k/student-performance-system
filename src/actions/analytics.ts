"use server";

import { prisma } from "@/server/lib";
import { GRADES, assignPlaces, finalResults, summarize } from "@/server";
import type { GroupStat, RatingItem, SubjectsResponse } from "@/models";
import { requirePermission } from "@/server/auth/session";

const fullName = (p: {
  last_name: string;
  first_name: string;
  middle_name?: string | null;
}) => [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");

const parseOptionalId = (value?: string): bigint | undefined => {
  const str = String(value ?? "").trim();
  if (!str) return undefined;
  if (!/^\d+$/.test(str)) {
    throw new Error("Некорректный идентификатор фильтра");
  }
  return BigInt(str);
};

const performanceWhere = (params?: {
  semester_id?: string;
  group_id?: string;
}) => {
  const where: any = {};
  const semesterId = parseOptionalId(params?.semester_id);
  const groupId = parseOptionalId(params?.group_id);
  if (semesterId !== undefined) where.semester_id = semesterId;
  if (groupId !== undefined) where.students = { group_id: groupId };
  return where;
};

const PERFORMANCE_SELECT = {
  student_id: true,
  subject_id: true,
  semester_id: true,
  assessment_type: true,
  attempt_number: true,
  grade: true,
  passed: true,
  students: { select: { group_id: true } },
} as const;

const groupBy = <T>(records: T[], keyOf: (r: T) => unknown) => {
  const map = new Map<string, T[]>();
  for (const r of records) {
    const key = String(keyOf(r));
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
};

export async function getRating(q?: string): Promise<RatingItem[]> {
  await requirePermission("analytics.read");
  const [students, rating, performance] = await Promise.all([
    prisma.students.findMany({ include: { student_groups: true } }),
    prisma.reyting.findMany(),
    prisma.student_performance.findMany({ select: PERFORMANCE_SELECT }),
  ]);

  const sums = new Map(
    rating.map((r) => [String(r.idstudent), r.summ_balls ?? 0]),
  );
  const byStudent = groupBy(
    finalResults(performance),
    (r: any) => r.student_id,
  );

  const items = students
    .map((s) => ({
      student_id: String(s.student_id),
      student_number: s.student_number,
      student_name: fullName(s),
      group_code: s.student_groups.group_code,
      summ_balls: sums.get(String(s.student_id)) ?? 0,
      average_grade: summarize(byStudent.get(String(s.student_id)) ?? [])
        .average_grade,
    }))
    .sort(
      (a, b) =>
        b.summ_balls - a.summ_balls ||
        a.student_name.localeCompare(b.student_name, "ru"),
    );

  const ranked = assignPlaces(items, (i: any) => i.summ_balls) as RatingItem[];

  const tokens = String(q ?? "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return ranked;

  return ranked.filter((i) => {
    const haystack =
      `${i.student_name} ${i.student_number} ${i.group_code}`.toLowerCase();
    return tokens.every((t) => haystack.includes(t));
  });
}
export async function getGroupsAnalytics(
  semester_id?: string,
): Promise<GroupStat[]> {
  await requirePermission("analytics.read");
  const [groups, performance] = await Promise.all([
    prisma.student_groups.findMany({ orderBy: { group_code: "asc" } }),
    prisma.student_performance.findMany({
      where: performanceWhere({ semester_id }),
      select: PERFORMANCE_SELECT,
    }),
  ]);

  const byGroup = groupBy(
    finalResults(performance),
    (r: any) => r.students.group_id,
  );

  return groups.map((g) => {
    const records = byGroup.get(String(g.group_id)) ?? [];
    const { grade_counts, ...stats } = summarize(records);
    return {
      group_id: String(g.group_id),
      group_code: g.group_code,
      group_name: g.group_name,
      students_count: new Set(records.map((r: any) => String(r.student_id)))
        .size,
      ...stats,
    };
  });
}

export async function getSubjectsAnalytics(params?: {
  semester_id?: string;
  group_id?: string;
}): Promise<SubjectsResponse> {
  await requirePermission("analytics.read");
  const [subjects, performance] = await Promise.all([
    prisma.subjects.findMany({ orderBy: { subject_name: "asc" } }),
    prisma.student_performance.findMany({
      where: performanceWhere(params),
      select: PERFORMANCE_SELECT,
    }),
  ]);

  const finals = finalResults(performance);
  const bySubject = groupBy(finals, (r: any) => r.subject_id);

  const rows = subjects
    .filter((s) => bySubject.has(String(s.subject_id)))
    .map((s) => {
      const { grade_counts, ...stats } = summarize(
        bySubject.get(String(s.subject_id))!,
      );
      const { 2: g2, 3: g3, 4: g4, 5: g5 } = grade_counts;
      return {
        subject_id: String(s.subject_id),
        subject_code: s.subject_code,
        subject_name: s.subject_name,
        ...stats,
        grade_2: g2,
        grade_3: g3,
        grade_4: g4,
        grade_5: g5,
      };
    });

  const total = summarize(finals).grade_counts;
  return {
    rows,
    distribution: GRADES.map((grade) => ({ grade, count: total[grade] })),
  };
}
