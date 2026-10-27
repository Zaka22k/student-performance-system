"use client";

import { useEffect, useRef, useState } from "react";
import { useModal, useToast } from "@ui-kit/components";
import { getErrorMessage, semesterLabel } from "@/utils";
import * as actions from "@/actions/semesters";
import type { Semester, SemesterInput } from "@/models";
import SemesterForm from "./SemesterForm";

const SEARCH_DEBOUNCE_MS = 300;

export function useSemestersPage() {
  const { openModal } = useModal();
  const toast = useToast();

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [query, setQuery] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  const reqId = useRef(0);

  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const load = async () => {
    const id = ++reqId.current;
    const rows = await actions.getSemesters(queryRef.current);
    if (id === reqId.current) {
      setSemesters(rows);
      setLoadFailed(false);
    }
  };

  const refresh = async (q: string = queryRef.current) => {
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
    semesterId: Semester["semester_id"] | undefined,
    data: SemesterInput,
  ) => {
    const label = semesterLabel(data);
    if (semesterId === undefined) {
      await actions.createSemester(data);
      toast.success("Семестр создан", {
        description: `Семестр ${label} добавлен`,
      });
    } else {
      await actions.updateSemester(semesterId, data);
      toast.success("Семестр обновлён", {
        description: `Изменения для ${label} сохранены`,
      });
    }
    void refresh();
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
      onAction: async () => {
        await actions.deleteSemester(semester.semester_id);
        toast.success("Семестр удалён", {
          description: label,
        });
        void refresh();
      },
    });
  };

  return { semesters, query, setQuery, loadFailed, load, openForm, openAlert };
}
