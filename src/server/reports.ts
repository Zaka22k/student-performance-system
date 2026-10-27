// src/server/reports.ts
import { assignPlaces, finalResults, isSuccess } from "./analytics";
import type { AssessmentType, Report, ReportColumn } from "../models";

export const ASSESSMENT_TYPES: AssessmentType[] = [
  "exam",
  "credit",
  "differentiated_credit",
  "coursework",
];

export const ASSESSMENT_LABELS: Record<AssessmentType, string> = {
  exam: "Экзамен",
  credit: "Зачёт",
  differentiated_credit: "Дифференцированный зачёт",
  coursework: "Курсовая работа",
};

const notFound = (message: string) =>
  Object.assign(new Error(message), { statusCode: 404 });

const badRequest = (message: string) =>
  Object.assign(new Error(message), { statusCode: 400 });

const pad = (n: number) => String(n).padStart(2, "0");

export const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
};

const fullName = (p: {
  last_name: string;
  first_name: string;
  middle_name?: string | null;
}) => [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");

const shortName = (p: {
  last_name: string;
  first_name: string;
  middle_name?: string | null;
}) =>
  [p.last_name, p.first_name, p.middle_name]
    .filter((x): x is string => Boolean(x))
    .map((part, i) => (i === 0 ? part : `${part.charAt(0)}.`))
    .join(" ");

const semesterLabel = (s: {
  academic_year_start: number;
  term_number: number;
}) =>
  `${s.academic_year_start}/${s.academic_year_start + 1}, ${s.term_number} семестр`;

const resultText = (r: {
  assessment_type: string;
  passed: boolean | null;
  grade: number | null;
}) => {
  if (r.assessment_type === "credit")
    return r.passed ? "Зачтено" : "Не зачтено";
  return r.grade === null || r.grade === undefined ? "" : String(r.grade);
};

const average = (records: { grade: number | null }[]) => {
  const graded = records.filter(
    (r): r is { grade: number } => r.grade !== null && r.grade !== undefined,
  );
  if (graded.length === 0) return null;
  return graded.reduce((sum, r) => sum + r.grade, 0) / graded.length;
};

const avgText = (value: number | null) =>
  value === null ? "—" : value.toFixed(2).replace(".", ",");

const now = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const bigint = (
  value: string | number | bigint | undefined,
  label = "параметр",
) => {
  const str = String(value ?? "").trim();
  if (!/^\d+$/.test(str)) {
    throw badRequest(`Не указан или некорректен параметр: ${label}`);
  }
  return BigInt(str);
};
// 1. Ведомость группы по дисциплине
export async function buildGroupSheet(
  prisma: any,
  query: Record<string, string | undefined>,
): Promise<Report> {
  const groupId = bigint(query.group_id, "группа");
  const subjectId = bigint(query.subject_id, "дисциплина");
  const semesterId = bigint(query.semester_id, "семестр");
  const aType = query.assessment_type as AssessmentType;

  if (!ASSESSMENT_TYPES.includes(aType)) {
    throw badRequest("Укажите корректный вид контроля");
  }

  const [group, subject, semester] = await Promise.all([
    prisma.student_groups.findUnique({
      where: { group_id: groupId },
    }),
    prisma.subjects.findUnique({
      where: { subject_id: subjectId },
    }),
    prisma.semesters.findUnique({
      where: { semester_id: semesterId },
    }),
  ]);
  if (!group) throw notFound("Группа не найдена");
  if (!subject) throw notFound("Дисциплина не найдена");
  if (!semester) throw notFound("Семестр не найден");

  const rows = await prisma.student_performance.findMany({
    where: {
      subject_id: subject.subject_id,
      semester_id: semester.semester_id,
      assessment_type: aType,
      students: { group_id: group.group_id },
    },
    include: { students: true, teachers: true },
  });

  const records = finalResults(rows).sort((a: any, b: any) =>
    fullName(a.students).localeCompare(fullName(b.students), "ru"),
  );

  const teachers = [
    ...new Map(
      records.map((r: any) => [String(r.teacher_id), r.teachers]),
    ).values(),
  ];

  const columns: ReportColumn[] = [
    { key: "no", title: "№", align: "center" },
    { key: "student", title: "Студент", align: "left" },
    { key: "student_number", title: "Номер студенческого", align: "left" },
    { key: "result", title: "Результат", align: "center" },
    { key: "attempt", title: "Попытка", align: "center" },
    { key: "date", title: "Дата", align: "center" },
    {
      key: "signature",
      title: "Подпись преподавателя",
      align: "left",
      print_only: true,
    },
  ];

  const body = records.map((r: any, i: number) => ({
    no: String(i + 1),
    student: fullName(r.students),
    student_number: r.students.student_number,
    result: resultText(r),
    attempt: String(r.attempt_number),
    date: formatDate(r.assessment_date),
    signature: "",
  }));

  const successful = records.filter(isSuccess).length;

  return {
    type: "group-sheet",
    title: "Ведомость группы по дисциплине",
    orientation: "portrait",
    params: [
      { label: "Группа", value: `${group.group_code} (${group.group_name})` },
      { label: "Дисциплина", value: subject.subject_name },
      { label: "Семестр", value: semesterLabel(semester) },
      {
        label: "Вид контроля",
        value: ASSESSMENT_LABELS[aType] ?? aType,
      },
    ],
    columns,
    rows: body,
    totals: [
      { label: "Число студентов", value: String(records.length) },
      { label: "Сдали", value: String(successful) },
      { label: "Средний балл", value: avgText(average(records)) },
    ],
    signatures: [
      {
        label: "Преподаватель",
        name: teachers.length ? teachers.map(shortName).join(", ") : "",
      },
    ],
    generated_at: now(),
  };
}
// 2. Зачётная книжка студента
export async function buildStudentBook(
  prisma: any,
  query: Record<string, string | undefined>,
): Promise<Report> {
  const studentId = bigint(query.student_id, "студент");

  const student = await prisma.students.findUnique({
    where: { student_id: studentId },
    include: { student_groups: true },
  });
  if (!student) throw notFound("Студент не найден");

  let semester = null;
  if (query.semester_id) {
    semester = await prisma.semesters.findUnique({
      where: { semester_id: bigint(query.semester_id, "семестр") },
    });
    if (!semester) throw notFound("Семестр не найден");
  }

  const rows = await prisma.student_performance.findMany({
    where: {
      student_id: student.student_id,
      ...(semester ? { semester_id: semester.semester_id } : {}),
    },
    include: { subjects: true, teachers: true, semesters: true },
  });

  const sorted = [...rows].sort(
    (a: any, b: any) =>
      a.assessment_date.getTime() - b.assessment_date.getTime() ||
      a.subjects.subject_name.localeCompare(b.subjects.subject_name, "ru") ||
      a.attempt_number - b.attempt_number,
  );

  const columns: ReportColumn[] = [
    { key: "no", title: "№", align: "center" },
    ...(semester
      ? []
      : [{ key: "semester", title: "Семестр", align: "left" as const }]),
    { key: "subject", title: "Дисциплина", align: "left" },
    { key: "hours", title: "Часы", align: "center" },
    { key: "type", title: "Вид контроля", align: "left" },
    { key: "teacher", title: "Преподаватель", align: "left" },
    { key: "result", title: "Результат", align: "center" },
    { key: "attempt", title: "Попытка", align: "center" },
    { key: "date", title: "Дата", align: "center" },
  ];

  const body = sorted.map((r: any, i: number) => ({
    no: String(i + 1),
    semester: semesterLabel(r.semesters),
    subject: r.subjects.subject_name,
    hours: String(r.subjects.total_hours),
    type:
      ASSESSMENT_LABELS[r.assessment_type as AssessmentType] ??
      r.assessment_type,
    teacher: shortName(r.teachers),
    result: resultText(r),
    attempt: String(r.attempt_number),
    date: formatDate(r.assessment_date),
  }));

  const finals = finalResults(rows);
  const credits = finals.filter((r: any) => r.assessment_type === "credit");

  return {
    type: "student-book",
    title: "Зачётная книжка студента",
    orientation: "landscape",
    params: [
      { label: "Студент", value: fullName(student) },
      { label: "Номер студенческого", value: student.student_number },
      { label: "Группа", value: student.student_groups.group_code },
      {
        label: "Семестр",
        value: semester ? semesterLabel(semester) : "Все семестры",
      },
    ],
    columns,
    rows: body,
    totals: [
      { label: "Средний балл", value: avgText(average(finals)) },
      {
        label: "Зачётов сдано",
        value: `${credits.filter(isSuccess).length} из ${credits.length}`,
      },
    ],
    signatures: [{ label: "Секретарь", name: "" }],
    generated_at: now(),
  };
}
// 3. Сводный отчёт по группе
export async function buildGroupSummary(
  prisma: any,
  query: Record<string, string | undefined>,
): Promise<Report> {
  const groupId = bigint(query.group_id, "группа");
  const semesterId = bigint(query.semester_id, "семестр");

  const [group, semester] = await Promise.all([
    prisma.student_groups.findUnique({
      where: { group_id: groupId },
    }),
    prisma.semesters.findUnique({
      where: { semester_id: semesterId },
    }),
  ]);
  if (!group) throw notFound("Группа не найдена");
  if (!semester) throw notFound("Семестр не найден");

  const [students, rows] = await Promise.all([
    prisma.students.findMany({ where: { group_id: group.group_id } }),
    prisma.student_performance.findMany({
      where: {
        semester_id: semester.semester_id,
        students: { group_id: group.group_id },
      },
      include: { subjects: true },
    }),
  ]);

  const finals = finalResults(rows);

  const columnMap = new Map<
    string,
    { key: string; subject: string; type: AssessmentType }
  >();
  for (const r of finals as any[]) {
    const key = `c${r.subject_id}_${r.assessment_type}`;
    if (!columnMap.has(key)) {
      columnMap.set(key, {
        key,
        subject: r.subjects.subject_name,
        type: r.assessment_type as AssessmentType,
      });
    }
  }
  const subjectColumns = [...columnMap.values()].sort(
    (a, b) =>
      a.subject.localeCompare(b.subject, "ru") ||
      ASSESSMENT_TYPES.indexOf(a.type) - ASSESSMENT_TYPES.indexOf(b.type),
  );

  const byStudent = new Map<string, any[]>();
  for (const r of finals as any[]) {
    const id = String(r.student_id);
    if (!byStudent.has(id)) byStudent.set(id, []);
    byStudent.get(id)!.push(r);
  }

  const items = students
    .map((s: any) => {
      const records = byStudent.get(String(s.student_id)) ?? [];
      return { student: s, records, avg: average(records) };
    })
    .sort(
      (a: any, b: any) =>
        (b.avg ?? -1) - (a.avg ?? -1) ||
        fullName(a.student).localeCompare(fullName(b.student), "ru"),
    );

  const ranked = assignPlaces(items, (i: any) => i.avg ?? -1);
  ranked.sort((a, b) =>
    fullName(a.student).localeCompare(fullName(b.student), "ru"),
  );

  const columns: ReportColumn[] = [
    { key: "no", title: "№", align: "center" },
    { key: "student", title: "Студент", align: "left" },
    ...subjectColumns.map((c) => ({
      key: c.key,
      title: `${c.subject} (${ASSESSMENT_LABELS[c.type].toLowerCase()})`,
      align: "center" as const,
    })),
    { key: "avg", title: "Средний балл", align: "center" },
    { key: "place", title: "Место в группе", align: "center" },
  ];

  const body = ranked.map((item, i) => {
    const row: Record<string, string> = {
      no: String(i + 1),
      student: fullName(item.student),
      avg: avgText(item.avg),
      place: item.avg === null ? "—" : String(item.place),
    };
    for (const c of subjectColumns) {
      const record = item.records.find(
        (r: any) => `c${r.subject_id}_${r.assessment_type}` === c.key,
      );
      row[c.key] = record ? resultText(record) : "—";
    }
    return row;
  });

  return {
    type: "group-summary",
    title: "Сводный отчёт по группе",
    orientation: "landscape",
    params: [
      { label: "Группа", value: `${group.group_code} (${group.group_name})` },
      { label: "Семестр", value: semesterLabel(semester) },
    ],
    columns,
    rows: body,
    totals: [
      { label: "Число студентов", value: String(students.length) },
      { label: "Средний балл группы", value: avgText(average(finals)) },
    ],
    signatures: [{ label: "Староста / куратор", name: "" }],
    generated_at: now(),
  };
}
