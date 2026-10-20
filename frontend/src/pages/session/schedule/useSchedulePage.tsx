import { useEffect, useRef, useState } from "react";
import type { Group, ScheduleItem, Semester } from "@models";
import * as api from "./schedule.api";

const DEBOUNCE_MS = 300;

export function useSchedulePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  // Значения ComboBox: id выбранного пункта или свой текст пользователя
  const [semesterId, setSemesterId] = useState("");
  const [groupId, setGroupId] = useState(""); // пусто — все группы
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ScheduleItem[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0); // номер последнего запроса: ответы устаревших игнорируются
  // Параметры, для которых список уже загружен: повторно их не запрашиваем
  const loadedKey = useRef("||");
  const keyOf = (sem: string, grp: string, q: string) => `${sem}|${grp}|${q}`;

  // Первая загрузка для Page: ошибка пробрасывается, Page покажет «Повторить».
  const load = async () => {
    const id = ++reqId.current;
    const opts = await api.getScheduleOptions();
    // По умолчанию показываем последний семестр (справочник упорядочен по времени)
    const sem = opts.semesters.at(-1)?.semester_id ?? "";
    const list = sem ? await api.getSchedule({ semesterId: sem, groupId, q: query }) : [];
    if (id !== reqId.current) return;
    loadedKey.current = keyOf(sem, groupId, query);
    setGroups(opts.groups);
    setSemesters(opts.semesters);
    setSemesterId(sem);
    setRows(list);
    setLoadFailed(false);
  };

  // Смена семестра, группы и поиска: ошибка не пробрасывается, а показывается вместо пустой таблицы.
  const refresh = async (sem: string, grp: string, q: string) => {
    const id = ++reqId.current;
    try {
      const list = await api.getSchedule({ semesterId: sem, groupId: grp, q });
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
      }
    }
  };

  const semesterValid = semesters.some((s) => s.semester_id === semesterId);
  const groupValid = groupId === "" || groups.some((g) => g.group_id === groupId);

  useEffect(() => {
    // Пока значения не меняли (или ввели текст, не совпавший с вариантом списка), ничего не грузим
    if (!semesterValid || !groupValid) return;
    if (keyOf(semesterId, groupId, query) === loadedKey.current) return;
    reqId.current++; // ответ на прежний запрос уже не нужен
    const timer = setTimeout(() => void refresh(semesterId, groupId, query), DEBOUNCE_MS);
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
