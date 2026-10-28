"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@ui-kit/components";
import { getErrorMessage } from "@/utils";
import { getSchedule } from "@/actions/session";
import type { Group, ScheduleItem, Semester } from "@/models";

const DEBOUNCE_MS = 300;

interface UseSchedulePageParams {
  groups: Group[];
  semesters: Semester[];
  initialSemesterId: string;
  initialRows: ScheduleItem[];
}

const keyOf = (sem: string, grp: string, q: string) => `${sem}|${grp}|${q}`;

export function useSchedulePage({
  groups,
  semesters,
  initialSemesterId,
  initialRows,
}: UseSchedulePageParams) {
  const toast = useToast();

  const [semesterId, setSemesterId] = useState(initialSemesterId);
  const [groupId, setGroupId] = useState("");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ScheduleItem[]>(initialRows);
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0);
  const loadedKey = useRef(keyOf(initialSemesterId, "", ""));

  const refresh = async (sem: string, grp: string, q: string) => {
    const id = ++reqId.current;
    try {
      const list = await getSchedule({
        semester_id: sem,
        group_id: grp || undefined,
        q: q || undefined,
      });
      if (id === reqId.current) {
        loadedKey.current = keyOf(sem, grp, q);
        setRows(list);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки расписания:", error);
      if (id === reqId.current) {
        loadedKey.current = keyOf(sem, grp, q);
        setRows([]);
        setLoadFailed(true);
        toast.error("Не удалось загрузить расписание", {
          description: getErrorMessage(error),
        });
      }
    }
  };

  const semesterValid = semesters.some(
    (s) => String(s.semester_id) === semesterId,
  );
  const groupValid =
    groupId === "" || groups.some((g) => String(g.group_id) === groupId);

  useEffect(() => {
    if (!semesterValid || !groupValid) return;
    if (keyOf(semesterId, groupId, query) === loadedKey.current) return;
    reqId.current++;
    const timer = setTimeout(
      () => void refresh(semesterId, groupId, query),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesterId, groupId, query, semesterValid, groupValid]);

  return {
    groups,
    semesters,
    semesterId,
    setSemesterId,
    groupId,
    setGroupId,
    query,
    setQuery,
    rows,
    loadFailed,
  };
}
