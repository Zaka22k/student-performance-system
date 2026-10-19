import { useEffect, useRef, useState } from "react";
import { ComboBox, type ModalFormRenderProps, TextField } from "@components";
import type { Student, StudentInput, StudentStatus, Group } from "@models";
import { useNoBlank } from "@hooks";
import { STATUS_OPTIONS } from "./statuses";

interface Props extends ModalFormRenderProps {
  initial?: Student;
  groups: Group[];
  onSubmit: (data: StudentInput) => void | Promise<void>;
}

// Тот же формат, что проверяют backend и БД
const EMAIL_PATTERN = "[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}";

export default function StudentForm({
  formId,
  isSubmitting,
  registerAction,
  initial,
  groups,
  onSubmit,
}: Props) {
  const [number, setNumber] = useState(initial?.student_number ?? "");
  const [lastName, setLastName] = useState(initial?.last_name ?? "");
  const [firstName, setFirstName] = useState(initial?.first_name ?? "");
  const [middleName, setMiddleName] = useState(initial?.middle_name ?? "");
  const [birthDate, setBirthDate] = useState(initial?.birth_date ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  // Для нового студента по умолчанию «Учится» (так же, как в БД)
  const [status, setStatus] = useState<string>(initial?.status ?? "active");
  // Значение ComboBox — id группы; если пользователь ввёл свой текст, здесь лежит он
  const [groupId, setGroupId] = useState(initial?.group_id ?? "");

  const numberRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLInputElement>(null);
  const groupRef = useRef<HTMLInputElement>(null);
  useNoBlank(numberRef, number);
  useNoBlank(lastNameRef, lastName);
  useNoBlank(firstNameRef, firstName);

  // ComboBox разрешает ввод своего текста, а нам нужен только вариант из списка
  useEffect(() => {
    statusRef.current?.setCustomValidity(
      STATUS_OPTIONS.some((o) => o.value === status)
        ? ""
        : "Выберите статус из списка",
    );
  }, [status]);
  useEffect(() => {
    groupRef.current?.setCustomValidity(
      groups.some((g) => g.group_id === groupId)
        ? ""
        : "Выберите группу из списка",
    );
  }, [groups, groupId]);

  const submitRef = useRef(onSubmit);
  useEffect(() => {
    submitRef.current = onSubmit;
  });

  useEffect(() => {
    registerAction(() =>
      submitRef.current({
        student_number: number.trim(),
        last_name: lastName.trim(),
        first_name: firstName.trim(),
        middle_name: middleName.trim() || null,
        birth_date: birthDate,
        email: email.trim() || null,
        status: status as StudentStatus,
        group_id: Number(groupId),
      }),
    );
  }, [
    registerAction,
    number,
    lastName,
    firstName,
    middleName,
    birthDate,
    email,
    status,
    groupId,
  ]);

  return (
    <form
      id={formId}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <TextField
        ref={numberRef}
        label="Номер студенческого"
        value={number}
        required
        maxLength={20}
        onChange={(e) => setNumber(e.target.value)}
        disabled={isSubmitting}
      />
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
        label="Дата рождения"
        type="date"
        value={birthDate}
        required
        min="1900-01-01"
        max="2100-12-31"
        onChange={(e) => setBirthDate(e.target.value)}
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
      <ComboBox
        ref={statusRef}
        label="Статус"
        options={STATUS_OPTIONS}
        valueKey="value"
        labelKey="label"
        value={status}
        required
        placeholder="Выберите статус"
        onChange={(value) => setStatus(value)}
        disabled={isSubmitting}
      />
      <ComboBox
        ref={groupRef}
        label="Группа"
        options={groups}
        valueKey="group_id"
        labelKey="group_code"
        value={groupId}
        required
        placeholder="Выберите группу"
        onChange={(value) => setGroupId(value)}
        disabled={isSubmitting}
      />
    </form>
  );
}
