import { useEffect, useRef, useState } from "react";
import { useModal } from "@components";
import { getErrorMessage } from "@api";
import * as api from "./students.api";
import type { Student, StudentInput, Group } from "@models";
import { fullName } from "@utils";
import StudentForm from "./StudentForm";

const SEARCH_DEBOUNCE_MS = 300;

export function useStudentsPage() {
  const { openModal } = useModal();
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]); // варианты для выбора группы в форме

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
    const [rows, groupRows] = await Promise.all([
      api.getStudents(queryRef.current),
      api.getGroupOptions(),
    ]);
    if (id === reqId.current) {
      setStudents(rows);
      setGroups(groupRows);
      setLoadFailed(false);
    }
  };

  // Обновление списка после поиска и сохранения: ошибка не пробрасывается,
  // а показывается вместо пустой таблицы.
  const refresh = async (q: string = queryRef.current) => {
    const id = ++reqId.current;
    try {
      const rows = await api.getStudents(q);
      if (id === reqId.current) {
        setStudents(rows);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки списка (students):", error);
      if (id === reqId.current) {
        setStudents([]);
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
    studentId: Student["student_id"] | undefined,
    data: StudentInput,
  ) => {
    if (studentId === undefined) await api.createStudent(data);
    else await api.updateStudent(studentId, data);
    await refresh(); // порядок строк и вычисляемые поля считает сервер
  };

  const openForm = (student?: Student) => {
    const studentId = student?.student_id;

    openModal({
      title:
        studentId === undefined
          ? "Создание студента"
          : "Редактирование студента",
      actionText: "Сохранить",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage, // сообщение backend показывается в окне
      content: (form) => (
        <StudentForm
          {...form}
          initial={student}
          groups={groups}
          onSubmit={(data) => handleSubmitForm(studentId, data)}
        />
      ),
    });
  };

  const openAlert = (student: Student) => {
    openModal({
      title: "Удаление студента",
      actionText: "Удалить",
      actionAppearance: "default",
      errorMessage: getErrorMessage, // например «У студента есть записи успеваемости»
      content: (
        <p>Вы действительно хотите удалить студента {fullName(student)}?</p>
      ),
      onAction: async () => {
        await api.deleteStudent(student.student_id);
        await refresh();
      },
    });
  };

  return { students, query, setQuery, loadFailed, load, openForm, openAlert };
}
