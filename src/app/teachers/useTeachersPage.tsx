"use client";

import {
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { useModal, useToast } from "@ui-kit/components";
import { getErrorMessage, fullName } from "@/utils";
import * as actions from "@/actions/teachers";
import type { Teacher, TeacherInput } from "@/models";
import { useDebounceValue } from "@/hooks";
import TeacherForm from "./TeacherForm";

const SEARCH_DEBOUNCE_MS = 300;

type OptimisticTeacherAction =
  | { type: "create"; data: TeacherInput; tempId: Teacher["teacher_id"] }
  | { type: "update"; teacherId: Teacher["teacher_id"]; data: TeacherInput }
  | { type: "delete"; teacherId: Teacher["teacher_id"] };

export function useTeachersPage(initialTeachers: Teacher[]) {
  const { openModal } = useModal();
  const toast = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounceValue(query, SEARCH_DEBOUNCE_MS);
  const [loadFailed, setLoadFailed] = useState(false);

  const [optimisticTeachers, applyOptimistic] = useOptimistic<
    Teacher[],
    OptimisticTeacherAction
  >(teachers, (current, action) => {
    switch (action.type) {
      case "create":
        return [
          ...current,
          { teacher_id: action.tempId, ...action.data } as Teacher,
        ];
      case "update":
        return current.map((t) =>
          t.teacher_id === action.teacherId ? { ...t, ...action.data } : t,
        );
      case "delete":
        return current.filter((t) => t.teacher_id !== action.teacherId);
    }
  });

  const reqId = useRef(0);

  const refresh = async (q: string = debouncedQuery) => {
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

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    void refresh(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const handleSubmitForm = async (
    teacherId: Teacher["teacher_id"] | undefined,
    data: TeacherInput,
  ) => {
    if (teacherId === undefined) {
      await actions.createTeacher(data);
      toast.success("Преподаватель создан", {
        description: fullName(data),
      });

      startTransition(async () => {
        applyOptimistic({
          type: "create",
          data,
          tempId: `temp-${Date.now()}` as unknown as Teacher["teacher_id"],
        });
        await refresh();
      });
    } else {
      await actions.updateTeacher(teacherId, data);
      toast.success("Изменения сохранены", {
        description: fullName(data),
      });

      startTransition(async () => {
        applyOptimistic({ type: "update", teacherId, data });
        await refresh();
      });
    }
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
      onAction: () => {
        startTransition(async () => {
          applyOptimistic({
            type: "delete",
            teacherId: teacher.teacher_id,
          });
          try {
            await actions.deleteTeacher(teacher.teacher_id);
            toast.success("Преподаватель удалён", {
              description: name,
            });
            await refresh();
          } catch (error) {
            toast.error("Не удалось удалить преподавателя", {
              description: getErrorMessage(error),
            });
          }
        });
      },
    });
  };

  return {
    teachers: optimisticTeachers,
    query,
    setQuery,
    loadFailed,
    openForm,
    openAlert,
  };
}
