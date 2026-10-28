"use client";

import { useEffect, useRef, useState } from "react";
import {
  ComboBox,
  type ModalFormRenderProps,
  TextField,
} from "@ui-kit/components";
import type { Student, StudentInput, StudentStatus, Group } from "@/models";
import { STATUS_OPTIONS } from "./statuses";

interface Props extends ModalFormRenderProps {
  initial?: Student;
  groups: Group[];
  onSubmit: (data: StudentInput) => void | Promise<void>;
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

export default function StudentForm({
  formId,
  isSubmitting,
  registerAction,
  initial,
  groups,
  onSubmit,
}: Props) {
  const [status, setStatus] = useState<string>(initial?.status ?? "active");
  const [groupId, setGroupId] = useState<string>(
    initial?.group_id !== undefined ? String(initial.group_id) : "",
  );

  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLInputElement>(null);
  const groupRef = useRef<HTMLInputElement>(null);
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  useEffect(() => {
    statusRef.current?.setCustomValidity(
      STATUS_OPTIONS.some((o) => o.value === status)
        ? ""
        : "Выберите статус из списка",
    );
  }, [status]);

  useEffect(() => {
    groupRef.current?.setCustomValidity(
      groups.some((g) => String(g.group_id) === groupId)
        ? ""
        : "Выберите группу из списка",
    );
  }, [groups, groupId]);

  useEffect(() => {
    registerAction(async () => {
      const form = formRef.current;
      if (!form) return;

      const formData = new FormData(form);

      await onSubmitRef.current({
        student_number: String(formData.get("student_number") ?? "").trim(),
        last_name: String(formData.get("last_name") ?? "").trim(),
        first_name: String(formData.get("first_name") ?? "").trim(),
        middle_name: String(formData.get("middle_name") ?? "").trim() || null,
        birth_date: String(formData.get("birth_date") ?? ""),
        email: String(formData.get("email") ?? "").trim() || null,
        status: String(formData.get("status") ?? "active") as StudentStatus,
        group_id: Number(formData.get("group_id")),
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
        label="Номер студенческого"
        name="student_number"
        defaultValue={initial?.student_number ?? ""}
        required
        maxLength={20}
        onChange={(e) => attachNoBlankValidation(e.currentTarget)}
        disabled={isSubmitting}
      />
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
        label="Дата рождения"
        name="birth_date"
        type="date"
        defaultValue={initial?.birth_date ?? ""}
        required
        min="1900-01-01"
        max="2100-12-31"
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
      <ComboBox
        ref={statusRef}
        name="status"
        label="Статус"
        options={STATUS_OPTIONS}
        valueKey="value"
        labelKey="label"
        value={status}
        required
        placeholder="Выберите статус"
        onChange={setStatus}
        disabled={isSubmitting}
      />
      <ComboBox
        ref={groupRef}
        name="group_id"
        label="Группа"
        options={groups}
        getOptionValue={(g) => String(g.group_id)}
        getOptionLabel={(g) => g.group_code}
        value={groupId}
        required
        placeholder="Выберите группу"
        onChange={setGroupId}
        disabled={isSubmitting}
      />
    </form>
  );
}
