import groups from "./groups.js";
import students from "./students.js";
import teachers from "./teachers.js";
import subjects from "./subjects.js";
import semesters from "./semesters.js";
import performance from "./performance.js";

export default async function routes(app) {
  app.get("/health", async () => {
    const [{ count }] = await app.prisma
      .$queryRaw`SELECT COUNT(*)::int AS count FROM student_performance`;
    return { status: "ok", performanceRows: count };
  });

  // Успеваемость
  await app.register(performance, { prefix: "/performance" });

  // Справочники
  await app.register(groups, { prefix: "/groups" });
  await app.register(students, { prefix: "/students" });
  await app.register(teachers, { prefix: "/teachers" });
  await app.register(subjects, { prefix: "/subjects" });
  await app.register(semesters, { prefix: "/semesters" });
}
