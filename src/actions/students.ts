"use server";

import { createCrudService, withActionError, prisma } from "@/server/lib";
import { studentSchema } from "@/schemas";
import type { Student, StudentInput } from "@/models";

export interface StudentPerformanceItem {
  performance_id: string;
  subject_name: string;
  teacher_name: string;
  semester: string;
  assessment_type: string;
  grade: number | null;
  passed: boolean | null;
  attempt_number: number;
  assessment_date: string;
}

const parseStudentId = (id: string): bigint => {
  const str = String(id ?? "").trim();
  if (!/^\d+$/.test(str)) {
    throw new Error("Студент не найден");
  }
  return BigInt(str);
};

const service = createCrudService<unknown, Student>({
  model: "students",
  idField: "student_id",
  orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
  include: { student_groups: true },
  search: {
    textFields: [
      "student_number",
      "last_name",
      "first_name",
      "middle_name",
      "email",
      "student_groups.group_code",
      "student_groups.group_name",
    ],
  },
  dateFields: ["birth_date"],
  schema: studentSchema,
  toDto: ({ student_groups, ...row }) => ({
    ...row,
    group_code: student_groups?.group_code,
    group_name: student_groups?.group_name,
  }),
  messages: {
    notFound: "Студент не найден",
    unique: "Студент с таким номером студенческого уже существует",
    inUse: "Студента нельзя удалить: по нему есть записи успеваемости",
    foreignKey: "Выбранная группа не найдена",
  },
});

export async function getStudents(q?: string): Promise<Student[]> {
  return service.list(q);
}

export async function getStudent(id: string): Promise<Student> {
  return service.getById(id);
}

export async function createStudent(data: StudentInput): Promise<Student> {
  return service.create(data);
}

export async function updateStudent(
  id: string,
  data: StudentInput,
): Promise<Student> {
  return service.update(id, data);
}

export async function deleteStudent(id: string): Promise<void> {
  return withActionError(
    async () => {
      const studentId = parseStudentId(id);
      await prisma.$transaction([
        // Если записей в student_performance нет, очищаем строку из reyting и удаляем студента
        prisma.reyting.deleteMany({ where: { idstudent: studentId } }),
        prisma.students.delete({ where: { student_id: studentId } }),
      ]);
    },
    {
      notFound: "Студент не найден",
      inUse: "Студента нельзя удалить: по нему есть записи успеваемости",
    },
    "delete",
  );
}

// Оценки студента для страницы просмотра карточки (аналог GET /students/:id/performance)
export async function getStudentPerformance(
  id: string,
): Promise<StudentPerformanceItem[]> {
  const studentId = parseStudentId(id);
  const rows = await prisma.student_performance.findMany({
    where: { student_id: studentId },
    include: { subjects: true, teachers: true, semesters: true },
    orderBy: [{ semester_id: "asc" }, { assessment_date: "asc" }],
  });

  return rows.map((row) => ({
    performance_id: String(row.performance_id),
    subject_name: row.subjects.subject_name,
    teacher_name: `${row.teachers.last_name} ${row.teachers.first_name}`,
    semester: `${row.semesters.academic_year_start}/${row.semesters.academic_year_start + 1}, семестр ${row.semesters.term_number}`,
    assessment_type: row.assessment_type,
    grade: row.grade,
    passed: row.passed,
    attempt_number: row.attempt_number,
    assessment_date: row.assessment_date.toISOString().slice(0, 10),
  }));
}
