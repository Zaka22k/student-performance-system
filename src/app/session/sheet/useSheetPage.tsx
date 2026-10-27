"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useModal, useToast } from "@/components";
import { createSheet } from "@/actions/session";
import { getGroups } from "@/actions/groups";
import { getStudents } from "@/actions/students";
import { getSubjects } from "@/actions/subjects";
import { getTeachers } from "@/actions/teachers";
import { getSemesters } from "@/actions/semesters";
import type { SheetInput, SheetOptions } from "@/models";

export function useSheetPage() {
  const router = useRouter();
  const { openModal } = useModal();
  const toast = useToast();
  const formId = useId();

  const [options, setOptions] = useState<SheetOptions | null>(null);
  // Меняется после успешного формирования: форма создаётся заново, оценки очищаются
  const [formKey, setFormKey] = useState(0);

  // Для Page: ошибка пробрасывается, Page покажет «Повторить»
  const load = async () => {
    const [groups, students, subjects, teachers, semesters] = await Promise.all(
      [
        getGroups(),
        getStudents(),
        getSubjects(),
        getTeachers(),
        getSemesters(),
      ],
    );
    setOptions({ groups, students, subjects, teachers, semesters });
  };

  const save = async (data: SheetInput) => {
    const { created } = await createSheet(data);
    setFormKey((k) => k + 1);

    toast.success("Ведомость сформирована", {
      description: `Создано записей в журнале: ${created}`,
    });

    openModal({
      title: "Ведомость сформирована",
      actionText: "К журналу",
      content: (
        <p className="BodyTextBlockStyle">
          Создано записей в журнале:{" "}
          <strong className="BodyStrongTextBlockStyle">{created}</strong>.
        </p>
      ),
      onAction: () => router.push("/performance"),
    });
  };

  return { options, formId, formKey, load, save };
}
