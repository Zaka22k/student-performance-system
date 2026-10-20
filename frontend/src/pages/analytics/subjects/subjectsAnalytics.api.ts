import { http } from "@api";
import type { Group, Semester, SubjectsResponse } from "@models";

// Пустые semesterId и groupId: все семестры и все группы
export const getSubjectStats = (
  { semesterId, groupId }: { semesterId?: string; groupId?: string },
  signal?: AbortSignal,
) =>
  http
    .get<SubjectsResponse>("/analytics/subjects", {
      params: { semester_id: semesterId || undefined, group_id: groupId || undefined },
      signal,
    })
    .then((r) => r.data);

// Справочники для параметров страницы
export const getOptions = async () => {
  const [semesters, groups] = await Promise.all([
    http.get<Semester[]>("/semesters").then((r) => r.data),
    http.get<Group[]>("/groups").then((r) => r.data),
  ]);
  return { semesters, groups };
};
