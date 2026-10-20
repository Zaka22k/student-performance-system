import groups from "./groups.js";
import students from "./students.js";
import teachers from "./teachers.js";
import subjects from "./subjects.js";
import semesters from "./semesters.js";
import performance from "./performance.js";
import session from "./session.js";
import analytics from "./analytics.js";

export default async function routes(app) {
  app.get("/health", async () => {
    const [{ count }] = await app.prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM student_performance`;
    return { status: "ok", performanceRows: count };
  });

  // Справочники
  await app.register(groups, { prefix: "/groups" });
  await app.register(students, { prefix: "/students" });
  await app.register(teachers, { prefix: "/teachers" });
  await app.register(subjects, { prefix: "/subjects" });
  await app.register(semesters, { prefix: "/semesters" });

  // Журнал успеваемости
  await app.register(performance, { prefix: "/performance" });

  // Сессия: расписание и формирование ведомости
  await app.register(session, { prefix: "/session" });

  // Аналитика: рейтинг, успеваемость по группам и дисциплинам
  await app.register(analytics, { prefix: "/analytics" });
}
