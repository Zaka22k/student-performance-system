"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components";
import { getErrorMessage } from "@/utils";
import { getSchedule } from "@/actions/session";
import { getSemesters } from "@/actions/semesters";
import { getGroups } from "@/actions/groups";
import type { Group, ScheduleItem, Semester } from "@/models";

const DEBOUNCE_MS = 300;

export function useSchedulePage() {
  const toast = useToast();

  const [groups, setGroups] = useState<Group[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [semesterId, setSemesterId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ScheduleItem[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0);

  const loadedKey = useRef("||");
  const keyOf = (sem: string, grp: string, q: string) => `${sem}|${grp}|${q}`;

  const load = async () => {
    const id = ++reqId.current;
    const [grps, sems] = await Promise.all([getGroups(), getSemesters()]);
    const sem =
      (semesterId && sems.some((s) => s.semester_id === semesterId)
        ? semesterId
        : sems.at(0)?.semester_id) ?? "";
    const list = sem
      ? await getSchedule({
          semester_id: sem,
          group_id: groupId || undefined,
          q: query || undefined,
        })
      : [];
    if (id !== reqId.current) return;
    loadedKey.current = keyOf(sem, groupId, query);
    setGroups(grps);
    setSemesters(sems);
    setSemesterId(sem);
    setRows(list);
    setLoadFailed(false);
  };

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

  const semesterValid = semesters.some((s) => s.semester_id === semesterId);
  const groupValid =
    groupId === "" || groups.some((g) => g.group_id === groupId);

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
    load,
  };
}
