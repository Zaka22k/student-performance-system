import type { AssessmentType } from "./performance";
import type { Group } from "./group";
import type { Student } from "./student";
import type { Subject } from "./subject";
import type { Teacher } from "./teacher";
import type { Semester } from "./semester";

// Строка расписания: дата + группа + дисциплина + вид контроля + попытка + преподаватель
export interface ScheduleItem {
  assessment_date: string; // YYYY-MM-DD
  group_id: string;
  group_code: string;
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
  assessment_type: AssessmentType;
  attempt_number: number;
  students_count: number;
}

// Формирование ведомости: оценки нужны для всех видов, кроме зачёта
export interface SheetInput {
  group_id: number;
  subject_id: number;
  teacher_id: number;
  semester_id: number;
  assessment_type: AssessmentType;
  attempt_number: number;
  assessment_date: string;
  grades: { student_id: number; grade: number }[];
}

export interface SheetResult {
  created: number;
}

// Справочники для выпадающих списков страницы ведомости
export interface SheetOptions {
  groups: Group[];
  students: Student[];
  subjects: Subject[];
  teachers: Teacher[];
  semesters: Semester[];
}
