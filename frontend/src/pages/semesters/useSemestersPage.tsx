import { useEffect, useRef, useState } from "react";
import { useModal } from "@components";
import { getErrorMessage } from "@api";
import * as api from "./semesters.api";
import type { Semester, SemesterInput } from "@models";
import { semesterLabel } from "@utils";
import SemesterForm from "./SemesterForm";

const SEARCH_DEBOUNCE_MS = 300;

export function useSemestersPage() {
  const { openModal } = useModal();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [query, setQuery] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0); // номер последнего запроса: ответы устаревших игнорируются

  // Актуальный запрос поиска. Окна из openModal хранят значения на момент открытия,
  // поэтому после сохранения список перезапрашивается с текущим текстом поиска из ref.
  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  // Первая загрузка для Page: ошибка пробрасывается, Page покажет «Повторить».
  const load = async () => {
    const id = ++reqId.current;
    const rows = await api.getSemesters(queryRef.current);
    if (id === reqId.current) {
      setSemesters(rows);
      setLoadFailed(false);
    }
  };

  // Обновление списка после поиска и сохранения: ошибка не пробрасывается,
  // а показывается вместо пустой таблицы.
  const refresh = async (q: string = queryRef.current) => {
    const id = ++reqId.current;
    try {
      const rows = await api.getSemesters(q);
      if (id === reqId.current) {
        setSemesters(rows);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки списка (semesters):", error);
      if (id === reqId.current) {
        setSemesters([]);
        setLoadFailed(true);
      }
    }
  };

  // Поиск на сервере: с задержкой, чтобы не слать запрос на каждую букву.
  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    reqId.current++; // ответ на прежний запрос уже не нужен
    const timer = setTimeout(() => void refresh(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSubmitForm = async (
    semesterId: Semester["semester_id"] | undefined,
    data: SemesterInput,
  ) => {
    if (semesterId === undefined) await api.createSemester(data);
    else await api.updateSemester(semesterId, data);
    await refresh(); // порядок строк и вычисляемые поля считает сервер
  };

  const openForm = (semester?: Semester) => {
    const semesterId = semester?.semester_id;

    openModal({
      title:
        semesterId === undefined
          ? "Создание семестра"
          : "Редактирование семестра",
      actionText: "Сохранить",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage, // сообщение backend показывается в окне
      content: (form) => (
        <SemesterForm
          {...form}
          initial={semester}
          onSubmit={(data) => handleSubmitForm(semesterId, data)}
        />
      ),
    });
  };

  const openAlert = (semester: Semester) => {
    openModal({
      title: "Удаление семестра",
      actionText: "Удалить",
      actionAppearance: "normal",
      errorMessage: getErrorMessage, // например «По нему есть записи успеваемости»
      content: (
        <p>
          Вы действительно хотите удалить семестр {semesterLabel(semester)}?
        </p>
      ),
      onAction: async () => {
        await api.deleteSemester(semester.semester_id);
        await refresh();
      },
    });
  };

  return { semesters, query, setQuery, loadFailed, load, openForm, openAlert };
}
