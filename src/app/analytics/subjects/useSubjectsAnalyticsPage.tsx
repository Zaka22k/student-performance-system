"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@ui-kit/components";
import { getErrorMessage } from "@/utils";
import { getSubjectsAnalytics } from "@/actions/analytics";
import type { Group, GradeBucket, Semester, SubjectStat } from "@/models";

const DEBOUNCE_MS = 300;

interface UseSubjectsAnalyticsPageParams {
  semesters: Semester[];
  groups: Group[];
  initialRows: SubjectStat[];
  initialDistribution: GradeBucket[];
}

const keyOf = (sem: string, grp: string) => `${sem}|${grp}`;

export function useSubjectsAnalyticsPage({
  semesters,
  groups,
  initialRows,
  initialDistribution,
}: UseSubjectsAnalyticsPageParams) {
  const toast = useToast();

  // Значения ComboBox: id пункта или свой текст пользователя; пусто — все семестры / все группы
  const [semesterId, setSemesterId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [rows, setRows] = useState<SubjectStat[]>(initialRows);
  const [distribution, setDistribution] =
    useState<GradeBucket[]>(initialDistribution);
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0);
  const loadedKey = useRef("|");

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
    semesterId === "" ||
    semesters.some((s) => String(s.semester_id) === semesterId);
  const groupValid =
    groupId === "" || groups.some((g) => String(g.group_id) === groupId);

  useEffect(() => {
    if (!semesterValid || !groupValid) return;
    if (keyOf(semesterId, groupId) === loadedKey.current) return;
    reqId.current++;
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
  };
}
