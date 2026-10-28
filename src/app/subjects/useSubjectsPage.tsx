"use client";

import {
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { useModal, useToast } from "@ui-kit/components";
import { getErrorMessage } from "@/utils";
import * as actions from "@/actions/subjects";
import type { Subject, SubjectInput } from "@/models";
import { useDebounceValue } from "@/hooks";
import SubjectForm from "./SubjectForm";

const SEARCH_DEBOUNCE_MS = 300;

type OptimisticSubjectAction =
  | { type: "create"; data: SubjectInput; tempId: Subject["subject_id"] }
  | { type: "update"; subjectId: Subject["subject_id"]; data: SubjectInput }
  | { type: "delete"; subjectId: Subject["subject_id"] };

export function useSubjectsPage(initialSubjects: Subject[]) {
  const { openModal } = useModal();
  const toast = useToast();

  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounceValue(query, SEARCH_DEBOUNCE_MS);
  const [loadFailed, setLoadFailed] = useState(false);

  const [optimisticSubjects, applyOptimistic] = useOptimistic<
    Subject[],
    OptimisticSubjectAction
  >(subjects, (current, action) => {
    switch (action.type) {
      case "create":
        return [
          ...current,
          { subject_id: action.tempId, ...action.data } as Subject,
        ];
      case "update":
        return current.map((s) =>
          s.subject_id === action.subjectId ? { ...s, ...action.data } : s,
        );
      case "delete":
        return current.filter((s) => s.subject_id !== action.subjectId);
    }
  });

  const reqId = useRef(0);

  const refresh = async (q: string = debouncedQuery) => {
    const id = ++reqId.current;
    try {
      const rows = await actions.getSubjects(q);
      if (id === reqId.current) {
        setSubjects(rows);
        setLoadFailed(false);
      }
    } catch (error) {
      console.error("Ошибка загрузки списка (subjects):", error);
      if (id === reqId.current) {
        setSubjects([]);
        setLoadFailed(true);
        toast.error("Не удалось обновить список дисциплин", {
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
    subjectId: Subject["subject_id"] | undefined,
    data: SubjectInput,
  ) => {
    if (subjectId === undefined) {
      await actions.createSubject(data);
      toast.success("Дисциплина создана", {
        description: `Дисциплина «${data.subject_name}» добавлена`,
      });

      startTransition(async () => {
        applyOptimistic({
          type: "create",
          data,
          tempId: `temp-${Date.now()}` as unknown as Subject["subject_id"],
        });
        await refresh();
      });
    } else {
      await actions.updateSubject(subjectId, data);
      toast.success("Дисциплина обновлена", {
        description: `Изменения в дисциплине «${data.subject_name}» сохранены`,
      });

      startTransition(async () => {
        applyOptimistic({ type: "update", subjectId, data });
        await refresh();
      });
    }
  };

  const openForm = (subject?: Subject) => {
    const subjectId = subject?.subject_id;

    openModal({
      title:
        subjectId === undefined
          ? "Создание дисциплины"
          : "Редактирование дисциплины",
      actionText: "Сохранить",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage,
      content: (form) => (
        <SubjectForm
          {...form}
          initial={subject}
          onSubmit={(data) => handleSubmitForm(subjectId, data)}
        />
      ),
    });
  };

  const openAlert = (subject: Subject) => {
    openModal({
      title: "Удаление дисциплины",
      actionText: "Удалить",
      actionAppearance: "destructive",
      errorMessage: getErrorMessage,
      content: (
        <p className="BodyTextBlockStyle">
          Вы действительно хотите удалить дисциплину «
          <strong className="BodyStrongTextBlockStyle">
            {subject.subject_name}
          </strong>
          »?
        </p>
      ),
      onAction: () => {
        startTransition(async () => {
          applyOptimistic({
            type: "delete",
            subjectId: subject.subject_id,
          });
          try {
            await actions.deleteSubject(subject.subject_id);
            toast.success("Дисциплина удалена", {
              description: `Дисциплина «${subject.subject_name}» удалена`,
            });
            await refresh();
          } catch (error) {
            toast.error("Не удалось удалить дисциплину", {
              description: getErrorMessage(error),
            });
          }
        });
      },
    });
  };

  return {
    subjects: optimisticSubjects,
    query,
    setQuery,
    loadFailed,
    openForm,
    openAlert,
  };
}
