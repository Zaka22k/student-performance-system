import { useEffect, useRef, useState } from "react";
import { useModal } from "@components";
import { getErrorMessage } from "@api";
import * as api from "./teachers.api";
import type { Teacher, TeacherInput } from "@models";
import { fullName } from "@utils";
import TeacherForm from "./TeacherForm";

const SEARCH_DEBOUNCE_MS = 300;

export function useTeachersPage() {
  const { openModal } = useModal();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
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
    const rows = await api.getTeachers(queryRef.current);
    if (id === reqId.current) {
      setTeachers(rows);
      setLoadFailed(false);
    }
  };

  // Обновление списка после поиска и сохранения: ошибка не пробрасывается,
  // а показывается вместо пустой таблицы.
  const refresh = async (q: string = queryRef.current) => {
    const id = ++reqId.current;
    try {
      const rows = await api.getTeachers(q);
      if (id === reqId.current) {
        setTeachers(rows);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки списка (teachers):", error);
      if (id === reqId.current) {
        setTeachers([]);
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
    teacherId: Teacher["teacher_id"] | undefined,
    data: TeacherInput,
  ) => {
    if (teacherId === undefined) await api.createTeacher(data);
    else await api.updateTeacher(teacherId, data);
    await refresh(); // порядок строк и вычисляемые поля считает сервер
  };

  const openForm = (teacher?: Teacher) => {
    const teacherId = teacher?.teacher_id;

    openModal({
      title:
        teacherId === undefined
          ? "Создание преподавателя"
          : "Редактирование преподавателя",
      actionText: "Сохранить",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage, // сообщение backend показывается в окне
      content: (form) => (
        <TeacherForm
          {...form}
          initial={teacher}
          onSubmit={(data) => handleSubmitForm(teacherId, data)}
        />
      ),
    });
  };

  const openAlert = (teacher: Teacher) => {
    openModal({
      title: "Удаление преподавателя",
      actionText: "Удалить",
      actionAppearance: "default",
      errorMessage: getErrorMessage, // например «Он указан в записях успеваемости»
      content: (
        <p>
          Вы действительно хотите удалить преподавателя {fullName(teacher)}?
        </p>
      ),
      onAction: async () => {
        await api.deleteTeacher(teacher.teacher_id);
        await refresh();
      },
    });
  };

  return { teachers, query, setQuery, loadFailed, load, openForm, openAlert };
}
