"use client";

import { useEffect, useRef, useState } from "react";
import { useModal, useToast } from "@ui-kit/components";
import { getErrorMessage, fullName } from "@/utils";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/actions/students";
import { getGroups } from "@/actions/groups";
import type { Student, StudentInput, Group } from "@/models";
import StudentForm from "./StudentForm";

const SEARCH_DEBOUNCE_MS = 300;

export function useStudentsPage() {
  const { openModal } = useModal();
  const toast = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  const [groups, setGroups] = useState<Group[]>([]);
  const groupsRef = useRef<Group[]>([]);

  const reqId = useRef(0);
  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const load = async () => {
    const id = ++reqId.current;
    const [rows, groupRows] = await Promise.all([
      getStudents(queryRef.current),
      getGroups(),
    ]);
    if (id === reqId.current) {
      groupsRef.current = groupRows;
      setStudents(rows);
      setGroups(groupRows);
      setLoadFailed(false);
    }
  };

  const refresh = async (q: string = queryRef.current) => {
    const id = ++reqId.current;
    try {
      const rows = await getStudents(q);
      if (id === reqId.current) {
        setStudents(rows);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки списка (students):", error);
      if (id === reqId.current) {
        setStudents([]);
        setLoadFailed(true);
        toast.error("Не удалось обновить список студентов", {
          description: getErrorMessage(error),
        });
      }
    }
  };
  const skipFirst = useRef(true);
  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    reqId.current++;
    const timer = setTimeout(() => void refresh(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSubmitForm = async (
    studentId: Student["student_id"] | undefined,
    data: StudentInput,
  ) => {
    const name = `${data.last_name} ${data.first_name}`;
    if (studentId === undefined) {
      await createStudent(data);
      toast.success("Студент добавлен", {
        description: `Запись «${name}» успешно создана`,
      });
    } else {
      await updateStudent(studentId, data);
      toast.success("Данные обновлены", {
        description: `Изменения для «${name}» сохранены`,
      });
    }
    void refresh();
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
      errorMessage: getErrorMessage,
      content: (form) => (
        <StudentForm
          {...form}
          initial={student}
          groups={groupsRef.current}
          onSubmit={(data) => handleSubmitForm(studentId, data)}
        />
      ),
    });
  };

  const openAlert = (student: Student) => {
    const name = fullName(student);

    openModal({
      title: "Удаление студента",
      actionText: "Удалить",
      actionAppearance: "destructive",
      errorMessage: getErrorMessage,
      content: (
        <p className="BodyTextBlockStyle">
          Вы действительно хотите удалить студента{" "}
          <strong className="BodyStrongTextBlockStyle">{name}</strong>?
        </p>
      ),
      onAction: async () => {
        await deleteStudent(student.student_id);
        toast.success("Студент удалён", {
          description: `Запись «${name}» удалена`,
        });
        void refresh();
      },
    });
  };

  return {
    students,
    groups,
    query,
    setQuery,
    loadFailed,
    load,
    openForm,
    openAlert,
  };
}
