import { buildSearchWhere } from "../lib/crud.js";
import { GRADES, assignPlaces, finalResults, summarize } from "../lib/analytics.js";

const ID = { type: "string", pattern: "^[0-9]+$" };

// Поля поиска по рейтингу (можно менять): ФИО, номер студенческого и код группы
const RATING_SEARCH = {
  textFields: ["last_name", "first_name", "middle_name", "student_number", "student_groups.group_code"],
};

const fullName = (p) => [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(" ");

// Условие выборки записей журнала: необязательные семестр и группа
const performanceWhere = ({ semester_id, group_id }) => {
  const where = {};
  if (semester_id) where.semester_id = BigInt(semester_id);
  if (group_id) where.students = { group_id: BigInt(group_id) };
  return where;
};

// Что нужно для расчётов (без лишних связей)
const PERFORMANCE_SELECT = {
  student_id: true,
  subject_id: true,
  semester_id: true,
  assessment_type: true,
  attempt_number: true,
  grade: true,
  passed: true,
  students: { select: { group_id: true } },
};

const groupBy = (records, keyOf) => {
  const map = new Map();
  for (const r of records) {
    const key = String(keyOf(r));
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  }
  return map;
};

export default async function analyticsRoutes(app) {
  const prisma = () => app.prisma;

  // Рейтинг студентов: GET /analytics/rating?q=...
  // Сумма оценок берётся из таблицы reyting (её ведут триггеры БД, зачёты дают 0),
  // средний балл считается по итоговым результатам с оценкой. Места считаются по всем студентам,
  // поиск только отбирает строки, поэтому место студента не зависит от запроса.
  app.get(
    "/rating",
    { schema: { querystring: { type: "object", properties: { q: { type: "string", maxLength: 100 } } } } },
    async (request) => {
      const [students, rating, performance] = await Promise.all([
        prisma().students.findMany({ include: { student_groups: true } }),
        prisma().reyting.findMany(),
        prisma().student_performance.findMany({ select: PERFORMANCE_SELECT }),
      ]);

      const sums = new Map(rating.map((r) => [String(r.idstudent), r.summ_balls ?? 0]));
      const byStudent = groupBy(finalResults(performance), (r) => r.student_id);

      const items = students
        .map((s) => ({
          student_id: s.student_id,
          student_number: s.student_number,
          student_name: fullName(s),
          group_code: s.student_groups.group_code,
          summ_balls: sums.get(String(s.student_id)) ?? 0,
          average_grade: summarize(byStudent.get(String(s.student_id)) ?? []).average_grade,
        }))
        .sort((a, b) => b.summ_balls - a.summ_balls || a.student_name.localeCompare(b.student_name, "ru"));

      const ranked = assignPlaces(items, (i) => i.summ_balls);

      // Поиск: по словам, каждое слово должно найтись в ФИО, номере или группе
      const tokens = String(request.query.q ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (tokens.length === 0) return ranked;
      return ranked.filter((i) => {
        const haystack = `${i.student_name} ${i.student_number} ${i.group_code}`.toLowerCase();
        return tokens.every((t) => haystack.includes(t));
      });
    },
  );

  // Успеваемость по группам: GET /analytics/groups?semester_id=...
  app.get(
    "/groups",
    { schema: { querystring: { type: "object", properties: { semester_id: ID } } } },
    async (request) => {
      const [groups, performance] = await Promise.all([
        prisma().student_groups.findMany({ orderBy: { group_code: "asc" } }),
        prisma().student_performance.findMany({
          where: performanceWhere(request.query),
          select: PERFORMANCE_SELECT,
        }),
      ]);

      const byGroup = groupBy(finalResults(performance), (r) => r.students.group_id);

      return groups.map((g) => {
        const records = byGroup.get(String(g.group_id)) ?? [];
        const { grade_counts, ...stats } = summarize(records);
        return {
          group_id: g.group_id,
          group_code: g.group_code,
          group_name: g.group_name,
          students_count: new Set(records.map((r) => String(r.student_id))).size, // студентов с результатами
          ...stats,
        };
      });
    },
  );

  // Успеваемость по дисциплинам: GET /analytics/subjects?semester_id=...&group_id=...
  // Ответ: строки по дисциплинам (только те, по которым есть результаты)
  // и общее распределение оценок для диаграммы
  app.get(
    "/subjects",
    { schema: { querystring: { type: "object", properties: { semester_id: ID, group_id: ID } } } },
    async (request) => {
      const [subjects, performance] = await Promise.all([
        prisma().subjects.findMany({ orderBy: { subject_name: "asc" } }),
        prisma().student_performance.findMany({
          where: performanceWhere(request.query),
          select: PERFORMANCE_SELECT,
        }),
      ]);

      const finals = finalResults(performance);
      const bySubject = groupBy(finals, (r) => r.subject_id);

      const rows = subjects
        .filter((s) => bySubject.has(String(s.subject_id)))
        .map((s) => {
          const { grade_counts, ...stats } = summarize(bySubject.get(String(s.subject_id)));
          return {
            subject_id: s.subject_id,
            subject_code: s.subject_code,
            subject_name: s.subject_name,
            ...stats,
            grade_2: grade_counts[2],
            grade_3: grade_counts[3],
            grade_4: grade_counts[4],
            grade_5: grade_counts[5],
          };
        });

      const total = summarize(finals).grade_counts;
      return { rows, distribution: GRADES.map((grade) => ({ grade, count: total[grade] })) };
    },
  );
}
