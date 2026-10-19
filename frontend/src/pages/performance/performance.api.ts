import { http } from "@api";
import type {
  Performance,
  PerformanceInput,
  PerformanceListResponse,
  PerformanceOptions,
  Semester,
  Student,
  Subject,
  Teacher,
} from "@models";

export interface PerformanceQuery {
  q?: string;
  cursor?: string;
}

// Список порциями. Если задан q, backend ищет по студенту, номеру, группе, дисциплине и преподавателю
export const getPerformanceList = ({ q, cursor }: PerformanceQuery = {}, signal?: AbortSignal) =>
  http
    .get<PerformanceListResponse>("/performance", {
      params: { q: q || undefined, cursor },
      signal,
    })
    .then((r) => r.data);

export const getPerformance = (id: string) =>
  http.get<Performance>(`/performance/${id}`).then((r) => r.data);

export const createPerformance = (data: PerformanceInput) =>
  http.post<Performance>("/performance", data).then((r) => r.data);

export const updatePerformance = (id: string, data: PerformanceInput) =>
  http.put<Performance>(`/performance/${id}`, data).then((r) => r.data);

export const deletePerformance = (id: string) =>
  http.delete(`/performance/${id}`).then(() => undefined);

// Справочники для формы: уже готовые маршруты справочников
export const getPerformanceOptions = async (): Promise<PerformanceOptions> => {
  const [students, subjects, teachers, semesters] = await Promise.all([
    http.get<Student[]>("/students").then((r) => r.data),
    http.get<Subject[]>("/subjects").then((r) => r.data),
    http.get<Teacher[]>("/teachers").then((r) => r.data),
    http.get<Semester[]>("/semesters").then((r) => r.data),
  ]);
  return { students, subjects, teachers, semesters };
};
