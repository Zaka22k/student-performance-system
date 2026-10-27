"use client";

import { useEffect, useRef, useState } from "react";
import { useModal, useToast } from "@ui-kit/components";
import { getErrorMessage, fullName } from "@/utils";
import * as actions from "@/actions/teachers";
import type { Teacher, TeacherInput } from "@/models";
import TeacherForm from "./TeacherForm";

const SEARCH_DEBOUNCE_MS = 300;

export function useTeachersPage() {
  const { openModal } = useModal();
  const toast = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [query, setQuery] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0);

  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const load = async () => {
    const id = ++reqId.current;
    const rows = await actions.getTeachers(queryRef.current);
    if (id === reqId.current) {
      setTeachers(rows);
      setLoadFailed(false);
    }
  };

  const refresh = async (q: string = queryRef.current) => {
    const id = ++reqId.current;
    try {
      const rows = await actions.getTeachers(q);
      if (id === reqId.current) {
        setTeachers(rows);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки списка (teachers):", error);
      if (id === reqId.current) {
        setTeachers([]);
        setLoadFailed(true);
        toast.error("Не удалось обновить список преподавателей", {
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
    teacherId: Teacher["teacher_id"] | undefined,
    data: TeacherInput,
  ) => {
    if (teacherId === undefined) {
      await actions.createTeacher(data);
      toast.success("Преподаватель создан", {
        description: fullName(data),
      });
    } else {
      await actions.updateTeacher(teacherId, data);
      toast.success("Изменения сохранены", {
        description: fullName(data),
      });
    }
    void refresh();
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
      errorMessage: getErrorMessage,
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
    const name = fullName(teacher);

    openModal({
      title: "Удаление преподавателя",
      actionText: "Удалить",
      actionAppearance: "destructive",
      errorMessage: getErrorMessage,
      content: (
        <p className="BodyTextBlockStyle">
          Вы действительно хотите удалить преподавателя{" "}
          <strong className="BodyStrongTextBlockStyle">{name}</strong>?
        </p>
      ),
      onAction: async () => {
        await actions.deleteTeacher(teacher.teacher_id);
        toast.success("Преподаватель удалён", {
          description: name,
        });
        void refresh();
      },
    });
  };

  return { teachers, query, setQuery, loadFailed, load, openForm, openAlert };
}
