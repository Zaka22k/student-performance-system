"use client";

import { useEffect, useRef, useState } from "react";
import { useModal, useToast } from "@/components";
import { getErrorMessage } from "@/utils";
import * as actions from "@/actions/subjects";
import type { Subject, SubjectInput } from "@/models";
import SubjectForm from "./SubjectForm";

const SEARCH_DEBOUNCE_MS = 300;

export function useSubjectsPage() {
  const { openModal } = useModal();
  const toast = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [query, setQuery] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0);

  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const load = async () => {
    const id = ++reqId.current;
    const rows = await actions.getSubjects(queryRef.current);
    if (id === reqId.current) {
      setSubjects(rows);
      setLoadFailed(false);
    }
  };

  const refresh = async (q: string = queryRef.current) => {
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
    subjectId: Subject["subject_id"] | undefined,
    data: SubjectInput,
  ) => {
    if (subjectId === undefined) {
      await actions.createSubject(data);
      toast.success("Дисциплина создана", {
        description: `Дисциплина «${data.subject_name}» добавлена`,
      });
    } else {
      await actions.updateSubject(subjectId, data);
      toast.success("Дисциплина обновлена", {
        description: `Изменения в дисциплине «${data.subject_name}» сохранены`,
      });
    }
    void refresh();
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
      onAction: async () => {
        await actions.deleteSubject(subject.subject_id);
        toast.success("Дисциплина удалена", {
          description: `Дисциплина «${subject.subject_name}» удалена`,
        });
        void refresh();
      },
    });
  };

  return { subjects, query, setQuery, loadFailed, load, openForm, openAlert };
}
