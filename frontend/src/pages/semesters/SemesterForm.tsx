import { useEffect, useRef, useState } from "react";
import { type ModalFormRenderProps, TextField } from "@components";
import type { Semester, SemesterInput } from "@models";

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
  const [year, setYear] = useState(String(initial?.academic_year_start ?? ""));
  const [term, setTerm] = useState(String(initial?.term_number ?? ""));
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [endDate, setEndDate] = useState(initial?.end_date ?? "");

  const endRef = useRef<HTMLInputElement>(null);
  // Даты в формате YYYY-MM-DD сравниваются как строки
  useEffect(() => {
    endRef.current?.setCustomValidity(
      startDate && endDate && endDate <= startDate
        ? "Дата окончания должна быть позже даты начала"
        : "",
    );
  }, [startDate, endDate]);

  const submitRef = useRef(onSubmit);
  useEffect(() => {
    submitRef.current = onSubmit;
  });

  useEffect(() => {
    registerAction(() =>
      submitRef.current({
        academic_year_start: Number(year),
        term_number: Number(term) as 1 | 2,
        start_date: startDate,
        end_date: endDate,
      }),
    );
  }, [registerAction, year, term, startDate, endDate]);

  return (
    <form
      id={formId}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <TextField
        label="Год начала учебного года"
        type="number"
        value={year}
        required
        min={2000}
        max={2100}
        step={1}
        onChange={(e) => setYear(e.target.value)}
        disabled={isSubmitting}
      />
      <TextField
        label="Номер семестра (1 или 2)"
        type="number"
        value={term}
        required
        min={1}
        max={2}
        step={1}
        onChange={(e) => setTerm(e.target.value)}
        disabled={isSubmitting}
      />
      <TextField
        label="Дата начала"
        type="date"
        value={startDate}
        required
        onChange={(e) => setStartDate(e.target.value)}
        disabled={isSubmitting}
      />
      <TextField
        ref={endRef}
        label="Дата окончания"
        type="date"
        value={endDate}
        required
        onChange={(e) => setEndDate(e.target.value)}
        disabled={isSubmitting}
      />
    </form>
  );
}
