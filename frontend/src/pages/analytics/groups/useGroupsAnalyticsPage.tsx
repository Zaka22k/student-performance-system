import { useEffect, useRef, useState } from "react";
import type { GroupStat, Semester } from "@models";
import * as api from "./groupsAnalytics.api";

const DEBOUNCE_MS = 300;

export function useGroupsAnalyticsPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  // Значение ComboBox: id семестра или свой текст пользователя; пусто — все семестры
  const [semesterId, setSemesterId] = useState("");
  const [rows, setRows] = useState<GroupStat[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0); // номер последнего запроса: ответы устаревших игнорируются
  const loadedId = useRef(""); // семестр, для которого список уже загружен

  // Первая загрузка для Page: ошибка пробрасывается, Page покажет «Повторить».
  const load = async () => {
    const id = ++reqId.current;
    const [sems, stats] = await Promise.all([api.getSemesters(), api.getGroupStats(semesterId)]);
    if (id !== reqId.current) return;
    loadedId.current = semesterId;
    setSemesters(sems);
    setRows(stats);
    setLoadFailed(false);
  };

  // Смена семестра: ошибка не пробрасывается, а показывается вместо пустой таблицы.
  const refresh = async (sem: string) => {
    const id = ++reqId.current;
    try {
      const stats = await api.getGroupStats(sem);
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
      }
    }
  };

  // Текст, не совпавший с вариантом списка, запрос не запускает
  const semesterValid = semesterId === "" || semesters.some((s) => s.semester_id === semesterId);

  useEffect(() => {
    if (!semesterValid || semesterId === loadedId.current) return;
    reqId.current++; // ответ на прежний запрос уже не нужен
    const timer = setTimeout(() => void refresh(semesterId), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semesterId, semesterValid]);

  return { semesters, semesterId, setSemesterId, rows, loadFailed, load };
}
