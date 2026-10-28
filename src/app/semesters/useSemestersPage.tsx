"use client";

import {
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { useModal, useToast } from "@ui-kit/components";
import { getErrorMessage, semesterLabel } from "@/utils";
import * as actions from "@/actions/semesters";
import type { Semester, SemesterInput } from "@/models";
import { useDebounceValue } from "@/hooks";
import SemesterForm from "./SemesterForm";

const SEARCH_DEBOUNCE_MS = 300;

type OptimisticSemesterAction =
  | { type: "create"; data: SemesterInput; tempId: Semester["semester_id"] }
  | { type: "update"; semesterId: Semester["semester_id"]; data: SemesterInput }
  | { type: "delete"; semesterId: Semester["semester_id"] };

export function useSemestersPage(initialSemesters: Semester[]) {
  const { openModal } = useModal();
  const toast = useToast();

  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounceValue(query, SEARCH_DEBOUNCE_MS);
  const [loadFailed, setLoadFailed] = useState(false);

  const [optimisticSemesters, applyOptimistic] = useOptimistic<
    Semester[],
    OptimisticSemesterAction
  >(semesters, (current, action) => {
    switch (action.type) {
      case "create":
        return [
          ...current,
          { semester_id: action.tempId, ...action.data } as Semester,
        ];
      case "update":
        return current.map((s) =>
          s.semester_id === action.semesterId ? { ...s, ...action.data } : s,
        );
      case "delete":
        return current.filter((s) => s.semester_id !== action.semesterId);
    }
  });

  const reqId = useRef(0);

  const refresh = async (q: string = debouncedQuery) => {
    const id = ++reqId.current;
    try {
      const rows = await actions.getSemesters(q);
      if (id === reqId.current) {
        setSemesters(rows);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки списка (semesters):", error);
      if (id === reqId.current) {
        setSemesters([]);
        setLoadFailed(true);
        toast.error("Не удалось обновить список семестров", {
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
    semesterId: Semester["semester_id"] | undefined,
    data: SemesterInput,
  ) => {
    const label = semesterLabel(data);
    if (semesterId === undefined) {
      await actions.createSemester(data);
      toast.success("Семестр создан", {
        description: `Семестр ${label} добавлен`,
      });

      startTransition(async () => {
        applyOptimistic({
          type: "create",
          data,
          tempId: `temp-${Date.now()}` as unknown as Semester["semester_id"],
        });
        await refresh();
      });
    } else {
      await actions.updateSemester(semesterId, data);
      toast.success("Семестр обновлён", {
        description: `Изменения для ${label} сохранены`,
      });

      startTransition(async () => {
        applyOptimistic({ type: "update", semesterId, data });
        await refresh();
      });
    }
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
      errorMessage: getErrorMessage,
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
    const label = semesterLabel(semester);

    openModal({
      title: "Удаление семестра",
      actionText: "Удалить",
      actionAppearance: "destructive",
      errorMessage: getErrorMessage,
      content: (
        <p className="BodyTextBlockStyle">
          Вы действительно хотите удалить семестр{" "}
          <strong className="BodyStrongTextBlockStyle">{label}</strong>?
        </p>
      ),
      onAction: () => {
        startTransition(async () => {
          applyOptimistic({
            type: "delete",
            semesterId: semester.semester_id,
          });
          try {
            await actions.deleteSemester(semester.semester_id);
            toast.success("Семестр удалён", {
              description: label,
            });
            await refresh();
          } catch (error) {
            toast.error("Не удалось удалить семестр", {
              description: getErrorMessage(error),
            });
          }
        });
      },
    });
  };

  return {
    semesters: optimisticSemesters,
    query,
    setQuery,
    loadFailed,
    openForm,
    openAlert,
  };
}
