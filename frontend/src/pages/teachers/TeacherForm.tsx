import { useEffect, useRef, useState } from "react";
import { type ModalFormRenderProps, TextField } from "@components";
import type { Teacher, TeacherInput } from "@models";
import { useNoBlank } from "@hooks";

interface Props extends ModalFormRenderProps {
  initial?: Teacher;
  onSubmit: (data: TeacherInput) => void | Promise<void>;
}

// Тот же формат, что проверяют backend и БД
const EMAIL_PATTERN = "[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}";

export default function TeacherForm({
  formId,
  isSubmitting,
  registerAction,
  initial,
  onSubmit,
}: Props) {
  const [lastName, setLastName] = useState(initial?.last_name ?? "");
  const [firstName, setFirstName] = useState(initial?.first_name ?? "");
  const [middleName, setMiddleName] = useState(initial?.middle_name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");

  const lastNameRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  useNoBlank(lastNameRef, lastName);
  useNoBlank(firstNameRef, firstName);

  const submitRef = useRef(onSubmit);
  useEffect(() => {
    submitRef.current = onSubmit;
  });

  useEffect(() => {
    registerAction(() =>
      submitRef.current({
        last_name: lastName.trim(),
        first_name: firstName.trim(),
        middle_name: middleName.trim() || null,
        email: email.trim() || null,
      }),
    );
  }, [registerAction, lastName, firstName, middleName, email]);

  return (
    <form
      id={formId}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <TextField
        ref={lastNameRef}
        label="Фамилия"
        value={lastName}
        required
        maxLength={50}
        onChange={(e) => setLastName(e.target.value)}
        disabled={isSubmitting}
      />
      <TextField
        ref={firstNameRef}
        label="Имя"
        value={firstName}
        required
        maxLength={50}
        onChange={(e) => setFirstName(e.target.value)}
        disabled={isSubmitting}
      />
      <TextField
        label="Отчество"
        value={middleName}
        maxLength={50}
        onChange={(e) => setMiddleName(e.target.value)}
        disabled={isSubmitting}
      />
      <TextField
        label="Email"
        type="email"
        value={email}
        maxLength={254}
        pattern={EMAIL_PATTERN}
        title="Адрес вида name@example.com"
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
      />
    </form>
  );
}
