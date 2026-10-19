import { http } from "@api";
import type { Teacher, TeacherInput } from "@models";
// Если задан q, backend ищет по ФИО и email
export const getTeachers = (q?: string, signal?: AbortSignal) =>
  http
    .get<Teacher[]>("/teachers", { params: q ? { q } : undefined, signal })
    .then((r) => r.data);

export const createTeacher = (data: TeacherInput) =>
  http.post<Teacher>("/teachers", data).then((r) => r.data);

export const updateTeacher = (id: string, data: TeacherInput) =>
  http.put<Teacher>(`/teachers/${id}`, data).then((r) => r.data);

export const deleteTeacher = (id: string) =>
  http.delete(`/teachers/${id}`).then(() => undefined);
