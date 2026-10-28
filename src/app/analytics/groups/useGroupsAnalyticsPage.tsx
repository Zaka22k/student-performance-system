"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@ui-kit/components";
import { getErrorMessage } from "@/utils";
import { getGroupsAnalytics } from "@/actions/analytics";
import type { GroupStat, Semester } from "@/models";

const DEBOUNCE_MS = 300;

export function useGroupsAnalyticsPage(
  semesters: Semester[],
  initialRows: GroupStat[],
) {
  const toast = useToast();

  // Значение ComboBox: id семестра или свой текст пользователя; пусто — все семестры
  const [semesterId, setSemesterId] = useState("");
  const [rows, setRows] = useState<GroupStat[]>(initialRows);
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0);
  const loadedId = useRef("");

  const refresh = async (sem: string) => {
    const id = ++reqId.current;
    try {
      const stats = await getGroupsAnalytics(sem || undefined);
      if (id === reqId.current) {
        loadedId.current = sem;
        setRows(stats);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки успеваемости по группам:", error);
      if (id === reqId.current) {
        loadedId.current = sem;
        setRows([]);
        setLoadFailed(true);
        toast.error("Не удалось загрузить статистику по группам", {
          description: getErrorMessage(error),
        });
      }
    }
  };

  // Текст, не совпавший с вариантом списка, запрос не запускает
  const semesterValid =
    semesterId === "" ||
    semesters.some((s) => String(s.semester_id) === semesterId);

  useEffect(() => {
    if (!semesterValid || semesterId === loadedId.current) return;
    reqId.current++;
    const timer = setTimeout(() => void refresh(semesterId), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesterId, semesterValid]);

  return { semesters, semesterId, setSemesterId, rows, loadFailed };
}
