"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useModal, useToast } from "@ui-kit/components";
import { createSheet } from "@/actions/session";
import type { SheetInput } from "@/models";

export function useSheetPage() {
  const router = useRouter();
  const { openModal } = useModal();
  const toast = useToast();
  const formId = useId();

  // Меняется после успешного формирования: форма создаётся заново, оценки очищаются
  const [formKey, setFormKey] = useState(0);

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

  return { formId, formKey, save };
}
