import { http } from "@api";
import type { GroupStat, Semester } from "@models";

// Пустой semesterId: все семестры
export const getGroupStats = (semesterId?: string, signal?: AbortSignal) =>
  http
    .get<GroupStat[]>("/analytics/groups", {
      params: { semester_id: semesterId || undefined },
      signal,
    })
    .then((r) => r.data);

export const getSemesters = () => http.get<Semester[]>("/semesters").then((r) => r.data);
