import { http } from "@api";
import type { Student, StudentInput, Group } from "@models";
// Если задан q, backend ищет по ФИО, номеру студенческого, email и коду группы
export const getStudents = (q?: string, signal?: AbortSignal) =>
  http
    .get<Student[]>("/students", { params: q ? { q } : undefined, signal })
    .then((r) => r.data);

export const createStudent = (data: StudentInput) =>
  http.post<Student>("/students", data).then((r) => r.data);

export const updateStudent = (id: string, data: StudentInput) =>
  http.put<Student>(`/students/${id}`, data).then((r) => r.data);

export const deleteStudent = (id: string) =>
  http.delete(`/students/${id}`).then(() => undefined);

// Список групп для выбора в форме студента
export const getGroupOptions = () =>
  http.get<Group[]>("/groups").then((r) => r.data);
