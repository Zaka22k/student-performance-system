import { prisma } from "./lib";
import { finalResults, summarize } from "./analytics";
import { requirePermission } from "@/server/auth/session";

export interface UpcomingEvent {
  id: string;
  date: string;
  groupCode: string;
  subjectName: string;
  assessmentType: string;
}

export interface HomeSummary {
  /** Разрешения пользователя: по ним главная решает, какие блоки показывать. */
  permissions: string[];
  /** `own`: показатели относятся только к самому студенту. */
  scope: "all" | "own";
  students: number;
  groups: number;
  semester: { academic_year_start: number; term_number: number } | null;
  averageGrade: number | null;
  successRate: number | null;
  upcoming: UpcomingEvent[];
}

const UPCOMING_LIMIT = 5;

export async function getHomeSummary(): Promise<HomeSummary> {
  const auth = await requirePermission("home.view");
  const has = (code: string) => auth.permissions.has(code);
  const hasAny = (...codes: string[]) => codes.some(has);

  // Данные считаются только для тех блоков, которые роль видит на главной.
  const canGrades = hasAny("grades.read.all", "grades.read.own");
  const canSchedule = hasAny(
    "session.schedule.read.all",
    "session.schedule.read.own",
  );
  const canCounts = has("dictionaries.read");
  const gradesOwn = !has("grades.read.all");
  const scheduleOwn = !has("session.schedule.read.all");

  // Без привязки к студенту «только свои» данные пусты, а не общие.
  const needsOwnStudent =
    (canGrades && gradesOwn) || (canSchedule && scheduleOwn);
  const ownStudent =
    needsOwnStudent && auth.studentId
      ? await prisma.students.findUnique({
          where: { student_id: auth.studentId },
          select: { student_id: true, group_id: true },
        })
      : null;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [students, groups, semester, upcomingRows] = await Promise.all([
    canCounts ? prisma.students.count({ where: { status: "active" } }) : 0,
    canCounts ? prisma.student_groups.count() : 0,
    prisma.semesters.findFirst({
      orderBy: [{ academic_year_start: "desc" }, { term_number: "desc" }],
    }),
    canSchedule && (!scheduleOwn || ownStudent)
      ? prisma.student_performance.findMany({
          where: {
            assessment_date: { gte: today },
            ...(scheduleOwn && ownStudent
              ? { students: { group_id: ownStudent.group_id } }
              : {}),
          },
          orderBy: { assessment_date: "asc" },
          take: 500,
          select: {
            assessment_date: true,
            assessment_type: true,
            subjects: { select: { subject_id: true, subject_name: true } },
            students: {
              select: {
                student_groups: {
                  select: { group_id: true, group_code: true },
                },
              },
            },
          },
        })
      : [],
  ]);

  let averageGrade: number | null = null;
  let successRate: number | null = null;
  if (semester && canGrades && (!gradesOwn || ownStudent)) {
    const rows = await prisma.student_performance.findMany({
      where: {
        semester_id: semester.semester_id,
        ...(gradesOwn && ownStudent ? { student_id: ownStudent.student_id } : {}),
      },
      select: {
        student_id: true,
        subject_id: true,
        semester_id: true,
        assessment_type: true,
        attempt_number: true,
        grade: true,
        passed: true,
      },
    });
    const stats = summarize(finalResults(rows));
    averageGrade = stats.average_grade;
    successRate = stats.success_rate;
  }

  const events = new Map<string, UpcomingEvent>();
  for (const row of upcomingRows) {
    const group = row.students.student_groups;
    const date = row.assessment_date.toISOString().slice(0, 10);
    const id = `${date}|${group.group_id}|${row.subjects.subject_id}|${row.assessment_type}`;
    if (!events.has(id)) {
      events.set(id, {
        id,
        date,
        groupCode: group.group_code,
        subjectName: row.subjects.subject_name,
        assessmentType: row.assessment_type,
      });
    }
  }

  return {
    permissions: [...auth.permissions],
    scope: gradesOwn ? "own" : "all",
    students,
    groups,
    semester: semester
      ? {
          academic_year_start: semester.academic_year_start,
          term_number: semester.term_number,
        }
      : null,
    averageGrade,
    successRate,
    upcoming: [...events.values()].slice(0, UPCOMING_LIMIT),
  };
}
