import { http } from "@api";
import type { Group, GroupInput } from "@models";

export const getGroups = (q?: string, signal?: AbortSignal) =>
  http
    .get<Group[]>("/groups", { params: q ? { q } : undefined, signal })
    .then((r) => r.data);

export const createGroup = (data: GroupInput) =>
  http.post<Group>("/groups", data).then((r) => r.data);

export const updateGroup = (id: string, data: GroupInput) =>
  http.put<Group>(`/groups/${id}`, data).then((r) => r.data);

export const deleteGroup = (id: string) =>
  http.delete(`/groups/${id}`).then(() => undefined);
