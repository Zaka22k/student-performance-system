"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components";
import { getErrorMessage } from "@/utils";
import { getSubjectsAnalytics } from "@/actions/analytics";
import { getSemesters } from "@/actions/semesters"; // или "@/actions/semesters"
import { getGroups } from "@/actions/groups"; // или "@/actions/groups"
import type { Group, GradeBucket, Semester, SubjectStat } from "@/models";

const DEBOUNCE_MS = 300;

export function useSubjectsAnalyticsPage() {
  const toast = useToast();

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  // Значения ComboBox: id пункта или свой текст пользователя; пусто — все семестры / все группы
  const [semesterId, setSemesterId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [rows, setRows] = useState<SubjectStat[]>([]);
  const [distribution, setDistribution] = useState<GradeBucket[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0); // номер последнего запроса: ответы устаревших игнорируются
  const loadedKey = useRef("|"); // параметры, для которых данные уже загружены
  const keyOf = (sem: string, grp: string) => `${sem}|${grp}`;

  // Первая загрузка для Page: ошибка пробрасывается, Page покажет «Повторить».
  const load = async () => {
    const id = ++reqId.current;
    const [sems, grps, stats] = await Promise.all([
      getSemesters(),
      getGroups(),
      getSubjectsAnalytics({
        semester_id: semesterId || undefined,
        group_id: groupId || undefined,
      }),
    ]);
    if (id !== reqId.current) return;
    loadedKey.current = keyOf(semesterId, groupId);
    setSemesters(sems);
    setGroups(grps);
    setRows(stats.rows);
    setDistribution(stats.distribution);
    setLoadFailed(false);
  };

  // Смена параметров: ошибка не пробрасывается, а показывается вместо пустой таблицы.
  const refresh = async (sem: string, grp: string) => {
    const id = ++reqId.current;
    try {
      const stats = await getSubjectsAnalytics({
        semester_id: sem || undefined,
        group_id: grp || undefined,
      });
      if (id === reqId.current) {
        loadedKey.current = keyOf(sem, grp);
        setRows(stats.rows);
        setDistribution(stats.distribution);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки успеваемости по дисциплинам:", error);
      if (id === reqId.current) {
        loadedKey.current = keyOf(sem, grp);
        setRows([]);
        setDistribution([]);
        setLoadFailed(true);
        toast.error("Не удалось загрузить статистику по дисциплинам", {
          description: getErrorMessage(error),
        });
      }
    }
  };

  // Текст, не совпавший с вариантом списка, запрос не запускает
  const semesterValid =
    semesterId === "" || semesters.some((s) => s.semester_id === semesterId);
  const groupValid =
    groupId === "" || groups.some((g) => g.group_id === groupId);

  useEffect(() => {
    if (!semesterValid || !groupValid) return;
    if (keyOf(semesterId, groupId) === loadedKey.current) return;
    reqId.current++; // ответ на прежний запрос уже не нужен
    const timer = setTimeout(
      () => void refresh(semesterId, groupId),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesterId, groupId, semesterValid, groupValid]);

  return {
    semesters,
    groups,
    semesterId,
    setSemesterId,
    groupId,
    setGroupId,
    rows,
    distribution,
    loadFailed,
    load,
  };
}
