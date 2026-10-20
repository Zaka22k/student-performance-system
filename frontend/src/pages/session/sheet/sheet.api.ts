import { http } from "@api";
import type {
  Group,
  SheetInput,
  SheetOptions,
  SheetResult,
  Semester,
  Student,
  Subject,
  Teacher,
} from "@models";

// Создаёт по записи в журнале для каждого студента группы со статусом «Учится»
export const createSheet = (data: SheetInput) =>
  http.post<SheetResult>("/session/sheet", data).then((r) => r.data);

// Справочники для формы: уже готовые маршруты справочников
export const getSheetOptions = async (): Promise<SheetOptions> => {
  const [groups, students, subjects, teachers, semesters] = await Promise.all([
    http.get<Group[]>("/groups").then((r) => r.data),
    http.get<Student[]>("/students").then((r) => r.data),
    http.get<Subject[]>("/subjects").then((r) => r.data),
    http.get<Teacher[]>("/teachers").then((r) => r.data),
    http.get<Semester[]>("/semesters").then((r) => r.data),
  ]);
  return { groups, students, subjects, teachers, semesters };
};
