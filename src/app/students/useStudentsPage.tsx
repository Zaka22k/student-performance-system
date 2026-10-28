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
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/actions/students";
import type { Student, StudentInput, Group } from "@/models";
import { useDebounceValue } from "@/hooks";
import StudentForm from "./StudentForm";

const SEARCH_DEBOUNCE_MS = 300;

type OptimisticStudentAction =
  | { type: "create"; data: StudentInput; tempId: Student["student_id"] }
  | { type: "update"; studentId: Student["student_id"]; data: StudentInput }
  | { type: "delete"; studentId: Student["student_id"] };

export function useStudentsPage(initialStudents: Student[], groups: Group[]) {
  const { openModal } = useModal();
  const toast = useToast();

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounceValue(query, SEARCH_DEBOUNCE_MS);
  const [loadFailed, setLoadFailed] = useState(false);

  const [optimisticStudents, applyOptimistic] = useOptimistic<
    Student[],
    OptimisticStudentAction
  >(students, (current, action) => {
    switch (action.type) {
      case "create": {
        const foundGroup = groups.find(
          (g) => String(g.group_id) === String(action.data.group_id),
        );

        const newStudent: Student = {
          ...action.data,
          student_id: action.tempId,
          group_id: String(action.data.group_id) as Student["group_id"],
          group_code: foundGroup?.group_code ?? "",
          group_name: foundGroup?.group_name ?? "",
        };

        return [...current, newStudent];
      }
      case "update": {
        const foundGroup = groups.find(
          (g) => String(g.group_id) === String(action.data.group_id),
        );

        return current.map((s) => {
          if (s.student_id !== action.studentId) return s;
          return {
            ...s,
            ...action.data,
            group_id: String(action.data.group_id) as Student["group_id"],
            group_code: foundGroup?.group_code ?? s.group_code,
            group_name: foundGroup?.group_name ?? s.group_name,
          };
        });
      }
      case "delete":
        return current.filter((s) => s.student_id !== action.studentId);
    }
  });

  const reqId = useRef(0);

  const refresh = async (q: string = debouncedQuery) => {
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
    studentId: Student["student_id"] | undefined,
    data: StudentInput,
  ) => {
    const name = `${data.last_name} ${data.first_name}`;
    if (studentId === undefined) {
      await createStudent(data);
      toast.success("Студент добавлен", {
        description: `Запись «${name}» успешно создана`,
      });

      startTransition(async () => {
        applyOptimistic({
          type: "create",
          data,
          tempId: `temp-${Date.now()}` as unknown as Student["student_id"],
        });
        await refresh();
      });
    } else {
      await updateStudent(studentId, data);
      toast.success("Данные обновлены", {
        description: `Изменения для «${name}» сохранены`,
      });

      startTransition(async () => {
        applyOptimistic({ type: "update", studentId, data });
        await refresh();
      });
    }
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
          groups={groups}
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
      onAction: () => {
        startTransition(async () => {
          applyOptimistic({
            type: "delete",
            studentId: student.student_id,
          });
          try {
            await deleteStudent(student.student_id);
            toast.success("Студент удалён", {
              description: `Запись «${name}» удалена`,
            });
            await refresh();
          } catch (error) {
            toast.error("Не удалось удалить студента", {
              description: getErrorMessage(error),
            });
          }
        });
      },
    });
  };

  return {
    students: optimisticStudents,
    query,
    setQuery,
    loadFailed,
    openForm,
    openAlert,
  };
}
