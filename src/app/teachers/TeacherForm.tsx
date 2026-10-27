"use client";

import { useEffect, useRef } from "react";
import { type ModalFormRenderProps, TextField } from "@/components";
import type { Teacher, TeacherInput } from "@/models";

interface Props extends ModalFormRenderProps {
  initial?: Teacher;
  onSubmit: (data: TeacherInput) => void | Promise<void>;
}

const EMAIL_PATTERN = "[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}";

function attachNoBlankValidation(input: HTMLInputElement | null) {
  if (!input) return;
  input.setCustomValidity(
    input.value.length > 0 && input.value.trim() === ""
      ? "Поле не может состоять из одних пробелов"
      : "",
  );
}

export default function TeacherForm({
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
        last_name: String(formData.get("last_name") ?? "").trim(),
        first_name: String(formData.get("first_name") ?? "").trim(),
        middle_name: String(formData.get("middle_name") ?? "").trim() || null,
        email: String(formData.get("email") ?? "").trim() || null,
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
        label="Фамилия"
        name="last_name"
        defaultValue={initial?.last_name ?? ""}
        required
        maxLength={50}
        onChange={(e) => attachNoBlankValidation(e.currentTarget)}
        disabled={isSubmitting}
      />
      <TextField
        label="Имя"
        name="first_name"
        defaultValue={initial?.first_name ?? ""}
        required
        maxLength={50}
        onChange={(e) => attachNoBlankValidation(e.currentTarget)}
        disabled={isSubmitting}
      />
      <TextField
        label="Отчество"
        name="middle_name"
        defaultValue={initial?.middle_name ?? ""}
        maxLength={50}
        onChange={(e) => attachNoBlankValidation(e.currentTarget)}
        disabled={isSubmitting}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        defaultValue={initial?.email ?? ""}
        maxLength={254}
        pattern={EMAIL_PATTERN}
        title="Адрес вида name@example.com"
        disabled={isSubmitting}
      />
    </form>
  );
}
