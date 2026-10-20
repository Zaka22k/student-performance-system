import { http } from "@api";
import type { Group, ScheduleItem, Semester } from "@models";

export interface ScheduleQuery {
  semesterId: string;
  groupId?: string; // нет — все группы
  q?: string;
}

// Если задан q, backend ищет по группе, дисциплине и преподавателю
export const getSchedule = ({ semesterId, groupId, q }: ScheduleQuery, signal?: AbortSignal) =>
  http
    .get<ScheduleItem[]>("/session/schedule", {
      params: { semester_id: semesterId, group_id: groupId || undefined, q: q || undefined },
      signal,
    })
    .then((r) => r.data);

// Справочники для параметров страницы
export const getScheduleOptions = async () => {
  const [groups, semesters] = await Promise.all([
    http.get<Group[]>("/groups").then((r) => r.data),
    http.get<Semester[]>("/semesters").then((r) => r.data),
  ]);
  return { groups, semesters };
};
