import type { Student } from "./student";
import type { Subject } from "./subject";
import type { Teacher } from "./teacher";
import type { Semester } from "./semester";

export type AssessmentType = "exam" | "credit" | "differentiated_credit" | "coursework";

// Запись журнала так, как её отдаёт backend (со связанными названиями)
export interface Performance {
  performance_id: string;
  student_id: string;
  student_number: string;
  student_name: string;
  group_code: string;
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
  semester_id: string;
  academic_year_start: number;
  term_number: number;
  assessment_type: AssessmentType;
  grade: number | null; // для зачёта null
  passed: boolean | null; // только для зачёта
  attempt_number: number;
  assessment_date: string; // YYYY-MM-DD
}

// Что уходит на сервер при создании и изменении (id связей числами)
export interface PerformanceInput {
  student_id: number;
  subject_id: number;
  teacher_id: number;
  semester_id: number;
  assessment_type: AssessmentType;
  grade: number | null;
  passed: boolean | null;
  attempt_number: number;
  assessment_date: string;
}

// Порция списка: nextCursor === null, когда записи кончились
export interface PerformanceListResponse {
  items: Performance[];
  nextCursor: string | null;
}

// Справочники для выпадающих списков формы
export interface PerformanceOptions {
  students: Student[];
  subjects: Subject[];
  teachers: Teacher[];
  semesters: Semester[];
}
