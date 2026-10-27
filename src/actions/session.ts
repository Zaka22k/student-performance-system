"use server";

import { prisma, buildSearchWhere, withActionError } from "@/server/lib";
import { sheetInputSchema } from "@/schemas";
import type { ScheduleItem, SheetInput, SheetResult } from "@/models";

const SCHEDULE_SEARCH = {
  textFields: [
    "students.student_groups.group_code",
    "subjects.subject_name",
    "subjects.subject_code",
    "teachers.last_name",
    "teachers.first_name",
  ],
};

const fullName = (p: {
  last_name: string;
  first_name: string;
  middle_name?: string | null;
}) => [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

const parseId = (value: string, label: string): bigint => {
  const str = String(value ?? "").trim();
  if (!/^\d+$/.test(str)) {
    throw new Error(`Некорректный идентификатор: ${label}`);
  }
  return BigInt(str);
};

export async function getSchedule(params: {
  semester_id: string;
  group_id?: string;
  q?: string;
}): Promise<ScheduleItem[]> {
  const { semester_id, group_id, q } = params;

  const conditions: any[] = [
    { semester_id: parseId(semester_id, "семестр") },
    buildSearchWhere(q, SCHEDULE_SEARCH),
  ];
  if (group_id) {
    conditions.push({ students: { group_id: parseId(group_id, "группа") } });
  }

  const rows = await prisma.student_performance.findMany({
    where: { AND: conditions.filter(Boolean) },
    include: {
      students: { include: { student_groups: true } },
      subjects: true,
      teachers: true,
    },
  });

  const items = new Map<string, ScheduleItem>();
  for (const row of rows) {
    const date = isoDate(row.assessment_date);
    const key = [
      date,
      row.students.group_id,
      row.subject_id,
      row.assessment_type,
      row.attempt_number,
      row.teacher_id,
    ].join("|");

    const item = items.get(key) ?? {
      assessment_date: date,
      group_id: String(row.students.group_id),
      group_code: row.students.student_groups.group_code,
      subject_id: String(row.subject_id),
      subject_name: row.subjects.subject_name,
      teacher_id: String(row.teacher_id),
      teacher_name: fullName(row.teachers),
      assessment_type: row.assessment_type as ScheduleItem["assessment_type"],
      attempt_number: row.attempt_number,
      students_count: 0,
    };
    item.students_count++;
    items.set(key, item);
  }

  return [...items.values()].sort(
    (a, b) =>
      a.assessment_date.localeCompare(b.assessment_date) ||
      a.group_code.localeCompare(b.group_code, "ru") ||
      a.subject_name.localeCompare(b.subject_name, "ru"),
  );
}
export async function createSheet(rawInput: SheetInput): Promise<SheetResult> {
  return withActionError(
    async () => {
      const body = sheetInputSchema.parse(rawInput);
      const isCredit = body.assessment_type === "credit";

      const students = await prisma.students.findMany({
        where: { group_id: body.group_id, status: "active" },
        orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
        select: {
          student_id: true,
          last_name: true,
          first_name: true,
          middle_name: true,
        },
      });

      if (students.length === 0) {
        throw new Error("В группе нет студентов со статусом «Учится»");
      }

      const gradeById = new Map(
        body.grades.map((g) => [String(g.student_id), g.grade]),
      );

      if (!isCredit) {
        const missing = students.filter(
          (s) => !gradeById.has(String(s.student_id)),
        );
        if (missing.length > 0) {
          const names = missing.slice(0, 3).map(fullName).join(", ");
          const more = missing.length > 3 ? ` и ещё ${missing.length - 3}` : "";
          throw new Error(`Не указана оценка: ${names}${more}`);
        }
      }

      const existing = await prisma.student_performance.count({
        where: {
          student_id: { in: students.map((s) => s.student_id) },
          subject_id: body.subject_id,
          semester_id: body.semester_id,
          assessment_type: body.assessment_type,
          attempt_number: body.attempt_number,
        },
      });

      if (existing > 0) {
        throw new Error(
          `Ведомость уже сформирована: по этой дисциплине, семестру, виду контроля и попытке записи есть у ${existing} студентов группы`,
        );
      }

      const result = await prisma.student_performance.createMany({
        data: students.map((s) => ({
          student_id: s.student_id,
          subject_id: body.subject_id,
          teacher_id: body.teacher_id,
          semester_id: body.semester_id,
          assessment_type: body.assessment_type,
          grade: isCredit
            ? null
            : (gradeById.get(String(s.student_id)) ?? null),
          passed: isCredit ? true : null,
          attempt_number: body.attempt_number,
          assessment_date: body.assessment_date,
        })),
      });

      return { created: result.count };
    },
    {
      notFound: "Не найдено",
      unique: "Ведомость уже сформирована: такие записи есть в журнале",
      foreignKey:
        "Указаны несуществующие группа, дисциплина, преподаватель или семестр",
    },
    "create",
  );
}
