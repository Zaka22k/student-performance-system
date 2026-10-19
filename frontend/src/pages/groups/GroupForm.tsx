import { useEffect, useRef, useState, type RefObject } from "react";
import { type ModalFormRenderProps, TextField } from "@components";
import type { Group, GroupInput } from "@models";

interface Props extends ModalFormRenderProps {
  initial?: Group;
  onSubmit: (data: GroupInput) => void | Promise<void>;
}

function useNoBlank(ref: RefObject<HTMLInputElement | null>, value: string) {
  useEffect(() => {
    ref.current?.setCustomValidity(
      value.length > 0 && value.trim() === ""
        ? "Поле не может состоять из одних пробелов"
        : "",
    );
  }, [ref, value]);
}

export default function GroupForm({
  formId,
  isSubmitting,
  registerAction,
  initial,
  onSubmit,
}: Props) {
  const [code, setCode] = useState(initial?.group_code ?? "");
  const [name, setName] = useState(initial?.group_name ?? "");
  const [program, setProgram] = useState(initial?.education_program ?? "");
  const [year, setYear] = useState(String(initial?.admission_year ?? ""));

  const codeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const programRef = useRef<HTMLInputElement>(null);
  useNoBlank(codeRef, code);
  useNoBlank(nameRef, name);
  useNoBlank(programRef, program);

  // Всегда вызываем свежую версию onSubmit, не добавляя её в зависимости
  const submitRef = useRef(onSubmit);
  useEffect(() => {
    submitRef.current = onSubmit;
  });

  // Кнопка «Сохранить» всегда видит актуальные значения полей
  useEffect(() => {
    registerAction(() =>
      submitRef.current({
        group_code: code.trim(),
        group_name: name.trim(),
        education_program: program.trim(),
        admission_year: Number(year),
      }),
    );
  }, [registerAction, code, name, program, year]);

  return (
    <form
      id={formId}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <TextField
        ref={codeRef}
        label="Код группы"
        value={code}
        required
        maxLength={20}
        onChange={(e) => setCode(e.target.value)}
        disabled={isSubmitting}
      />
      <TextField
        ref={nameRef}
        label="Название"
        value={name}
        required
        maxLength={100}
        onChange={(e) => setName(e.target.value)}
        disabled={isSubmitting}
      />
      <TextField
        ref={programRef}
        label="Направление"
        value={program}
        required
        maxLength={200}
        onChange={(e) => setProgram(e.target.value)}
        disabled={isSubmitting}
      />
      <TextField
        label="Год набора"
        type="number"
        value={year}
        required
        min={2000}
        max={2100}
        step={1}
        onChange={(e) => setYear(e.target.value)}
        disabled={isSubmitting}
      />
    </form>
  );
}
