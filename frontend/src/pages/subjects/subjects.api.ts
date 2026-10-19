import { http } from "@api";
import type { Subject, SubjectInput } from "@models";
// Если задан q, backend ищет по коду и названию
export const getSubjects = (q?: string, signal?: AbortSignal) =>
  http
    .get<Subject[]>("/subjects", { params: q ? { q } : undefined, signal })
    .then((r) => r.data);

export const createSubject = (data: SubjectInput) =>
  http.post<Subject>("/subjects", data).then((r) => r.data);

export const updateSubject = (id: string, data: SubjectInput) =>
  http.put<Subject>(`/subjects/${id}`, data).then((r) => r.data);

export const deleteSubject = (id: string) =>
  http.delete(`/subjects/${id}`).then(() => undefined);
