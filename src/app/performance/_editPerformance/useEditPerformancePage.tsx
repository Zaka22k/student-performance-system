"use client";

import { startTransition, useId } from "react";
import { useRouter } from "next/navigation";
import { useModal, useToast } from "@ui-kit/components";
import { getErrorMessage } from "@/utils";
import {
  createPerformance,
  updatePerformance,
  deletePerformance,
} from "@/actions/performance";
import type { Performance, PerformanceInput } from "@/models";

const LIST_PATH = "/performance";

export function useEditPerformancePage(id?: string, record?: Performance) {
  const router = useRouter();
  const { openModal } = useModal();
  const toast = useToast();
  const formId = useId();

  const goBack = () => {
    router.push(LIST_PATH);
  };

  const save = async (data: PerformanceInput) => {
    if (id) {
      await updatePerformance(id, data);
      toast.success("Запись обновлена", {
        description: "Изменения сохранены в журнале успеваемости",
      });
    } else {
      await createPerformance(data);
      toast.success("Запись создана", {
        description: "Новая запись добавлена в журнал успеваемости",
      });
    }

    startTransition(() => {
      router.push(LIST_PATH);
    });
  };

  const openAlert = () => {
    if (!id) return;
    openModal({
      title: "Удаление записи",
      actionText: "Удалить",
      actionAppearance: "destructive",
      errorMessage: getErrorMessage,
      content: (
        <p className="BodyTextBlockStyle">
          Вы действительно хотите удалить эту запись{" "}
          {record ? (
            <>
              студента{" "}
              <strong className="BodyStrongTextBlockStyle">
                {record.student_name}
              </strong>{" "}
              по дисциплине «
              <strong className="BodyStrongTextBlockStyle">
                {record.subject_name}
              </strong>
              »
            </>
          ) : null}
          ?
        </p>
      ),
      onAction: async () => {
        await deletePerformance(id);
        toast.success("Запись удалена", {
          description: record
            ? `${record.student_name} — ${record.subject_name}`
            : undefined,
        });

        startTransition(() => {
          router.push(LIST_PATH);
        });
      },
    });
  };

  return {
    formId,
    goBack,
    save,
    openAlert,
  };
}
