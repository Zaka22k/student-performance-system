"use client";

import { useEffect, useRef } from "react";
import { type ModalFormRenderProps, TextField } from "@ui-kit/components";
import type { Semester, SemesterInput } from "@/models";

interface Props extends ModalFormRenderProps {
  initial?: Semester;
  onSubmit: (data: SemesterInput) => void | Promise<void>;
}

export default function SemesterForm({
  formId,
  isSubmitting,
  registerAction,
  initial,
  onSubmit,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;

  const syncDatesValidity = () => {
    const start = startRef.current?.value ?? "";
    const end = endRef.current?.value ?? "";
    endRef.current?.setCustomValidity(
      start && end && end <= start
        ? "Дата окончания должна быть позже даты начала"
        : "",
    );
  };

  useEffect(() => {
    registerAction(async () => {
      const form = formRef.current;
      if (!form) return;

      const formData = new FormData(form);

      await submitRef.current({
        academic_year_start: Number(formData.get("academic_year_start")),
        term_number: Number(formData.get("term_number")) as 1 | 2,
        start_date: String(formData.get("start_date") ?? ""),
        end_date: String(formData.get("end_date") ?? ""),
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
        label="Год начала учебного года"
        name="academic_year_start"
        type="number"
        defaultValue={
          initial?.academic_year_start !== undefined
            ? String(initial.academic_year_start)
            : ""
        }
        required
        min={2000}
        max={2100}
        step={1}
        disabled={isSubmitting}
      />
      <TextField
        label="Номер семестра (1 или 2)"
        name="term_number"
        type="number"
        defaultValue={
          initial?.term_number !== undefined ? String(initial.term_number) : ""
        }
        required
        min={1}
        max={2}
        step={1}
        disabled={isSubmitting}
      />
      <TextField
        ref={startRef}
        label="Дата начала"
        name="start_date"
        type="date"
        defaultValue={initial?.start_date ?? ""}
        required
        onChange={syncDatesValidity}
        disabled={isSubmitting}
      />
      <TextField
        ref={endRef}
        label="Дата окончания"
        name="end_date"
        type="date"
        defaultValue={initial?.end_date ?? ""}
        required
        onChange={syncDatesValidity}
        disabled={isSubmitting}
      />
    </form>
  );
}
