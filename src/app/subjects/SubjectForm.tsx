"use client";

import { useEffect, useRef } from "react";
import { type ModalFormRenderProps, TextField } from "@/components";
import type { Subject, SubjectInput } from "@/models";

interface Props extends ModalFormRenderProps {
  initial?: Subject;
  onSubmit: (data: SubjectInput) => void | Promise<void>;
}

function attachNoBlankValidation(input: HTMLInputElement | null) {
  if (!input) return;
  input.setCustomValidity(
    input.value.length > 0 && input.value.trim() === ""
      ? "Поле не может состоять из одних пробелов"
      : "",
  );
}

export default function SubjectForm({
  formId,
  isSubmitting,
  registerAction,
  initial,
  onSubmit,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef(onSubmit);

  useEffect(() => {
    submitRef.current = onSubmit;
  });

  useEffect(() => {
    registerAction(async () => {
      const form = formRef.current;
      if (!form) return;

      const formData = new FormData(form);

      await submitRef.current({
        subject_code: String(formData.get("subject_code") ?? "").trim(),
        subject_name: String(formData.get("subject_name") ?? "").trim(),
        total_hours: Number(formData.get("total_hours")),
        credits: Number(formData.get("credits")),
      });
    });
  }, [registerAction]);

  return (
    <form
      ref={formRef}
      id={formId}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <TextField
        label="Код дисциплины"
        name="subject_code"
        defaultValue={initial?.subject_code ?? ""}
        required
        maxLength={20}
        onChange={(e) => attachNoBlankValidation(e.currentTarget)}
        disabled={isSubmitting}
      />
      <TextField
        label="Название"
        name="subject_name"
        defaultValue={initial?.subject_name ?? ""}
        required
        maxLength={150}
        onChange={(e) => attachNoBlankValidation(e.currentTarget)}
        disabled={isSubmitting}
      />
      <TextField
        label="Часы"
        name="total_hours"
        type="number"
        defaultValue={
          initial?.total_hours !== undefined ? String(initial.total_hours) : ""
        }
        required
        min={1}
        max={32767}
        step={1}
        disabled={isSubmitting}
      />
      <TextField
        label="Зачётные единицы"
        name="credits"
        type="number"
        defaultValue={
          initial?.credits !== undefined ? String(initial.credits) : ""
        }
        required
        min={0}
        max={30}
        step={0.1}
        disabled={isSubmitting}
      />
    </form>
  );
}
