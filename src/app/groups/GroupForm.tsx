"use client";

import { useEffect, useRef } from "react";
import { type ModalFormRenderProps, TextField } from "@ui-kit/components";
import type { Group, GroupInput } from "@/models";

interface Props extends ModalFormRenderProps {
  initial?: Group;
  onSubmit: (data: GroupInput) => void | Promise<void>;
}

function attachNoBlankValidation(input: HTMLInputElement | null) {
  if (!input) return;
  input.setCustomValidity(
    input.value.length > 0 && input.value.trim() === ""
      ? "Поле не может состоять из одних пробелов"
      : "",
  );
}

export default function GroupForm({
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
        group_code: String(formData.get("group_code") ?? "").trim(),
        group_name: String(formData.get("group_name") ?? "").trim(),
        education_program: String(
          formData.get("education_program") ?? "",
        ).trim(),
        admission_year: Number(formData.get("admission_year")),
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
        label="Код группы"
        name="group_code"
        defaultValue={initial?.group_code ?? ""}
        required
        maxLength={20}
        onChange={(e) => attachNoBlankValidation(e.currentTarget)}
        disabled={isSubmitting}
      />
      <TextField
        label="Название"
        name="group_name"
        defaultValue={initial?.group_name ?? ""}
        required
        maxLength={100}
        onChange={(e) => attachNoBlankValidation(e.currentTarget)}
        disabled={isSubmitting}
      />
      <TextField
        label="Направление"
        name="education_program"
        defaultValue={initial?.education_program ?? ""}
        required
        maxLength={200}
        onChange={(e) => attachNoBlankValidation(e.currentTarget)}
        disabled={isSubmitting}
      />
      <TextField
        label="Год набора"
        name="admission_year"
        type="number"
        defaultValue={
          initial?.admission_year !== undefined
            ? String(initial.admission_year)
            : ""
        }
        required
        min={2000}
        max={2100}
        step={1}
        disabled={isSubmitting}
      />
    </form>
  );
}
