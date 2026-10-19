import { useEffect, useRef, useState } from "react";
import { type ModalFormRenderProps, TextField } from "@components";
import type { Subject, SubjectInput } from "@models";
import { useNoBlank } from "@hooks";

interface Props extends ModalFormRenderProps {
  initial?: Subject;
  onSubmit: (data: SubjectInput) => void | Promise<void>;
}

export default function SubjectForm({
  formId,
  isSubmitting,
  registerAction,
  initial,
  onSubmit,
}: Props) {
  const [code, setCode] = useState(initial?.subject_code ?? "");
  const [name, setName] = useState(initial?.subject_name ?? "");
  const [hours, setHours] = useState(String(initial?.total_hours ?? ""));
  const [credits, setCredits] = useState(String(initial?.credits ?? ""));

  const codeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  useNoBlank(codeRef, code);
  useNoBlank(nameRef, name);

  const submitRef = useRef(onSubmit);
  useEffect(() => {
    submitRef.current = onSubmit;
  });

  useEffect(() => {
    registerAction(() =>
      submitRef.current({
        subject_code: code.trim(),
        subject_name: name.trim(),
        total_hours: Number(hours),
        credits: Number(credits),
      }),
    );
  }, [registerAction, code, name, hours, credits]);

  return (
    <form
      id={formId}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <TextField
        ref={codeRef}
        label="Код дисциплины"
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
        maxLength={150}
        onChange={(e) => setName(e.target.value)}
        disabled={isSubmitting}
      />
      <TextField
        label="Часы"
        type="number"
        value={hours}
        required
        min={1}
        max={32767}
        step={1}
        onChange={(e) => setHours(e.target.value)}
        disabled={isSubmitting}
      />
      <TextField
        label="Зачётные единицы"
        type="number"
        value={credits}
        required
        min={0}
        max={30}
        step={0.1}
        onChange={(e) => setCredits(e.target.value)}
        disabled={isSubmitting}
      />
    </form>
  );
}
