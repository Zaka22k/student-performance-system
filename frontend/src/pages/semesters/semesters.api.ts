import { http } from "@api";
import type { Semester, SemesterInput } from "@models";
export const getSemesters = (q?: string, signal?: AbortSignal) =>
  http
    .get<Semester[]>("/semesters", { params: q ? { q } : undefined, signal })
    .then((r) => r.data);

export const createSemester = (data: SemesterInput) =>
  http.post<Semester>("/semesters", data).then((r) => r.data);

export const updateSemester = (id: string, data: SemesterInput) =>
  http.put<Semester>(`/semesters/${id}`, data).then((r) => r.data);

export const deleteSemester = (id: string) =>
  http.delete(`/semesters/${id}`).then(() => undefined);
