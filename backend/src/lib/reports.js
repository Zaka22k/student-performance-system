// Построители отчётов. Каждый возвращает один и тот же формат, из которого потом
// делаются JSON для страницы, XML, печатная форма (HTML) и PDF:
//
//   {
//     type, title, orientation: "portrait" | "landscape",
//     params:     [{ label, value }],                  // параметры отчёта
//     columns:    [{ key, title, align, print_only }], // столбцы таблицы
//     rows:       [{ [key]: "текст" }],                // все значения уже строки
//     totals:     [{ label, value }],                  // итоги
//     signatures: [{ label, name }],                   // строки для подписей (только печать)
//     generated_at: "YYYY-MM-DD HH:MM"
//   }
//
// Итоговые результаты считаются так же, как в аналитике: по паре
// «студент + дисциплина + семестр + вид контроля» берётся последняя попытка.

import { assignPlaces, finalResults, isSuccess } from "./analytics.js";

export const ASSESSMENT_TYPES = ["exam", "credit", "differentiated_credit", "coursework"];

export const ASSESSMENT_LABELS = {
  exam: "Экзамен",
  credit: "Зачёт",
  differentiated_credit: "Дифференцированный зачёт",
  coursework: "Курсовая работа",
};

const notFound = (message) => Object.assign(new Error(message), { statusCode: 404 });

const pad = (n) => String(n).padStart(2, "0");

// Date из Prisma (@db.Date, UTC) → 11.01.2027
export const formatDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
};

const fullName = (p) => [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");

// «Иванов И. И.»
const shortName = (p) =>
  [p.last_name, p.first_name, p.middle_name]
    .filter(Boolean)
    .map((part, i) => (i === 0 ? part : `${part[0]}.`))
    .join(" ");

const semesterLabel = (s) => `${s.academic_year_start}/${s.academic_year_start + 1}, ${s.term_number} семестр`;

const resultText = (r) => {
  if (r.assessment_type === "credit") return r.passed ? "Зачтено" : "Не зачтено";
  return r.grade === null || r.grade === undefined ? "" : String(r.grade);
};

const average = (records) => {
  const graded = records.filter((r) => r.grade !== null && r.grade !== undefined);
  if (graded.length === 0) return null;
  return graded.reduce((sum, r) => sum + r.grade, 0) / graded.length;
};

const avgText = (value) => (value === null ? "—" : value.toFixed(2).replace(".", ","));

const now = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const bigint = (value) => BigInt(value);

// ---------------------------------------------------------------------------
// 1. Ведомость группы по дисциплине
// params: group_id, subject_id, semester_id, assessment_type
// ---------------------------------------------------------------------------
export async function buildGroupSheet(prisma, query) {
  const [group, subject, semester] = await Promise.all([
    prisma.student_groups.findUnique({ where: { group_id: bigint(query.group_id) } }),
    prisma.subjects.findUnique({ where: { subject_id: bigint(query.subject_id) } }),
    prisma.semesters.findUnique({ where: { semester_id: bigint(query.semester_id) } }),
  ]);
  if (!group) throw notFound("Группа не найдена");
  if (!subject) throw notFound("Дисциплина не найдена");
  if (!semester) throw notFound("Семестр не найден");

  const rows = await prisma.student_performance.findMany({
    where: {
      subject_id: subject.subject_id,
      semester_id: semester.semester_id,
      assessment_type: query.assessment_type,
      students: { group_id: group.group_id },
    },
    include: { students: true, teachers: true },
  });

  // Одна строка на студента: итоговая (последняя) попытка
  const records = finalResults(rows).sort((a, b) =>
    fullName(a.students).localeCompare(fullName(b.students), "ru"),
  );

  const teachers = [...new Map(records.map((r) => [String(r.teacher_id), r.teachers])).values()];

  const columns = [
    { key: "no", title: "№", align: "center" },
    { key: "student", title: "Студент", align: "left" },
    { key: "student_number", title: "Номер студенческого", align: "left" },
    { key: "result", title: "Результат", align: "center" },
    { key: "attempt", title: "Попытка", align: "center" },
    { key: "date", title: "Дата", align: "center" },
    { key: "signature", title: "Подпись преподавателя", align: "left", print_only: true },
  ];

  const body = records.map((r, i) => ({
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
      { label: "Вид контроля", value: ASSESSMENT_LABELS[query.assessment_type] },
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

// ---------------------------------------------------------------------------
// 2. Зачётная книжка студента
// params: student_id, semester_id (необязателен, без него все семестры)
// ---------------------------------------------------------------------------
export async function buildStudentBook(prisma, query) {
  const student = await prisma.students.findUnique({
    where: { student_id: bigint(query.student_id) },
    include: { student_groups: true },
  });
  if (!student) throw notFound("Студент не найден");

  let semester = null;
  if (query.semester_id) {
    semester = await prisma.semesters.findUnique({ where: { semester_id: bigint(query.semester_id) } });
    if (!semester) throw notFound("Семестр не найден");
  }

  const rows = await prisma.student_performance.findMany({
    where: {
      student_id: student.student_id,
      ...(semester ? { semester_id: semester.semester_id } : {}),
    },
    include: { subjects: true, teachers: true, semesters: true },
  });

  // В книжке видны все попытки, по дате; итоги считаются только по итоговым
  const sorted = [...rows].sort(
    (a, b) =>
      a.assessment_date - b.assessment_date ||
      a.subjects.subject_name.localeCompare(b.subjects.subject_name, "ru") ||
      a.attempt_number - b.attempt_number,
  );

  const columns = [
    { key: "no", title: "№", align: "center" },
    ...(semester ? [] : [{ key: "semester", title: "Семестр", align: "left" }]),
    { key: "subject", title: "Дисциплина", align: "left" },
    { key: "hours", title: "Часы", align: "center" },
    { key: "type", title: "Вид контроля", align: "left" },
    { key: "teacher", title: "Преподаватель", align: "left" },
    { key: "result", title: "Результат", align: "center" },
    { key: "attempt", title: "Попытка", align: "center" },
    { key: "date", title: "Дата", align: "center" },
  ];

  const body = sorted.map((r, i) => ({
    no: String(i + 1),
    semester: semesterLabel(r.semesters),
    subject: r.subjects.subject_name,
    hours: String(r.subjects.total_hours),
    type: ASSESSMENT_LABELS[r.assessment_type],
    teacher: shortName(r.teachers),
    result: resultText(r),
    attempt: String(r.attempt_number),
    date: formatDate(r.assessment_date),
  }));

  const finals = finalResults(rows);
  const credits = finals.filter((r) => r.assessment_type === "credit");

  return {
    type: "student-book",
    title: "Зачётная книжка студента",
    orientation: "landscape",
    params: [
      { label: "Студент", value: fullName(student) },
      { label: "Номер студенческого", value: student.student_number },
      { label: "Группа", value: student.student_groups.group_code },
      { label: "Семестр", value: semester ? semesterLabel(semester) : "Все семестры" },
    ],
    columns,
    rows: body,
    totals: [
      { label: "Средний балл", value: avgText(average(finals)) },
      { label: "Зачётов сдано", value: `${credits.filter(isSuccess).length} из ${credits.length}` },
    ],
    signatures: [{ label: "Секретарь", name: "" }],
    generated_at: now(),
  };
}

// ---------------------------------------------------------------------------
// 3. Сводный отчёт по группе
// params: group_id, semester_id
// ---------------------------------------------------------------------------
export async function buildGroupSummary(prisma, query) {
  const [group, semester] = await Promise.all([
    prisma.student_groups.findUnique({ where: { group_id: bigint(query.group_id) } }),
    prisma.semesters.findUnique({ where: { semester_id: bigint(query.semester_id) } }),
  ]);
  if (!group) throw notFound("Группа не найдена");
  if (!semester) throw notFound("Семестр не найден");

  const [students, rows] = await Promise.all([
    prisma.students.findMany({ where: { group_id: group.group_id } }),
    prisma.student_performance.findMany({
      where: { semester_id: semester.semester_id, students: { group_id: group.group_id } },
      include: { subjects: true },
    }),
  ]);

  const finals = finalResults(rows);

  // Столбцы: каждая пара «дисциплина + вид контроля», по названию и виду
  const columnMap = new Map();
  for (const r of finals) {
    const key = `c${r.subject_id}_${r.assessment_type}`;
    if (!columnMap.has(key)) {
      columnMap.set(key, {
        key,
        subject: r.subjects.subject_name,
        type: r.assessment_type,
      });
    }
  }
  const subjectColumns = [...columnMap.values()].sort(
    (a, b) =>
      a.subject.localeCompare(b.subject, "ru") ||
      ASSESSMENT_TYPES.indexOf(a.type) - ASSESSMENT_TYPES.indexOf(b.type),
  );

  const byStudent = new Map();
  for (const r of finals) {
    const id = String(r.student_id);
    if (!byStudent.has(id)) byStudent.set(id, []);
    byStudent.get(id).push(r);
  }

  const items = students
    .map((s) => {
      const records = byStudent.get(String(s.student_id)) ?? [];
      return { student: s, records, avg: average(records) };
    })
    // порядок для мест: по убыванию среднего балла, студенты без оценок в конце
    .sort(
      (a, b) =>
        (b.avg ?? -1) - (a.avg ?? -1) ||
        fullName(a.student).localeCompare(fullName(b.student), "ru"),
    );

  const ranked = assignPlaces(items, (i) => i.avg ?? -1);
  // в таблице студенты идут по алфавиту, место остаётся от рейтинга
  ranked.sort((a, b) => fullName(a.student).localeCompare(fullName(b.student), "ru"));

  const columns = [
    { key: "no", title: "№", align: "center" },
    { key: "student", title: "Студент", align: "left" },
    ...subjectColumns.map((c) => ({
      key: c.key,
      title: `${c.subject} (${ASSESSMENT_LABELS[c.type].toLowerCase()})`,
      align: "center",
    })),
    { key: "avg", title: "Средний балл", align: "center" },
    { key: "place", title: "Место в группе", align: "center" },
  ];

  const body = ranked.map((item, i) => {
    const row = {
      no: String(i + 1),
      student: fullName(item.student),
      avg: avgText(item.avg),
      place: item.avg === null ? "—" : String(item.place),
    };
    for (const c of subjectColumns) {
      const record = item.records.find(
        (r) => `c${r.subject_id}_${r.assessment_type}` === c.key,
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
