"use client";

import { useEffect, useRef, useState } from "react";
import {
  ComboBox,
  type ModalFormRenderProps,
  TextField,
} from "@ui-kit/components";
import styles from "./Admin.module.css";

export interface AdminRoleOption {
  role_id: string;
  role_code: string;
  role_name: string;
}

export interface LinkedOption {
  id: string;
  label: string;
}

export interface UserFormRecord {
  user_id: string;
  username: string;
  role_id: string;
  role_code: string;
  student_id: string | null;
  teacher_id: string | null;
}

interface UserCreateFormProps extends ModalFormRenderProps {
  roles: AdminRoleOption[];
  students: LinkedOption[];
  teachers: LinkedOption[];
  onSubmit: (data: {
    username: string;
    password: string;
    role_id: string;
    student_id: string | null;
    teacher_id: string | null;
  }) => void | Promise<void>;
}

export function UserCreateForm({
  formId,
  isSubmitting,
  registerAction,
  roles,
  students,
  teachers,
  onSubmit,
}: UserCreateFormProps) {
  const [roleId, setRoleId] = useState(roles[0]?.role_id ?? "");
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;
  const selectedRole = roles.find((role) => role.role_id === roleId);

  useEffect(() => {
    registerAction(async () => {
      const form = formRef.current;
      if (!form) return;
      const data = new FormData(form);
      const role = roles.find((item) => item.role_id === String(data.get("role_id") ?? ""));
      await submitRef.current({
        username: String(data.get("username") ?? "").trim(),
        password: String(data.get("password") ?? ""),
        role_id: String(data.get("role_id") ?? ""),
        student_id: role?.role_code === "student" ? String(data.get("student_id") ?? "") || null : null,
        teacher_id: role?.role_code === "teacher" ? String(data.get("teacher_id") ?? "") || null : null,
      });
    });
  }, [registerAction, roles]);

  return (
    <form ref={formRef} id={formId} className={styles.form}>
      <TextField
        label="Логин"
        name="username"
        placeholder="например, ivan.petrov"
        autoComplete="off"
        minLength={3}
        maxLength={80}
        required
        disabled={isSubmitting}
      />
      <TextField
        label="Временный пароль"
        name="password"
        type="password"
        placeholder="Не менее 12 символов"
        autoComplete="new-password"
        minLength={12}
        maxLength={128}
        required
        disabled={isSubmitting}
      />
      <ComboBox
        label="Роль"
        name="role_id"
        options={roles}
        getOptionValue={(role) => role.role_id}
        getOptionLabel={(role) => `${role.role_name} · ${role.role_code}`}
        value={roleId}
        required
        placeholder="Выберите роль"
        onChange={(value) => {
          setRoleId(value);
          setStudentId("");
          setTeacherId("");
        }}
        disabled={isSubmitting}
      />
      {selectedRole?.role_code === "student" && (
        <ComboBox
          label="Связанный студент"
          name="student_id"
          options={students}
          getOptionValue={(student) => student.id}
          getOptionLabel={(student) => student.label}
          value={studentId}
          required
          placeholder="Найдите студента"
          onChange={setStudentId}
          disabled={isSubmitting}
        />
      )}
      {selectedRole?.role_code === "teacher" && (
        <ComboBox
          label="Связанный преподаватель"
          name="teacher_id"
          options={teachers}
          getOptionValue={(teacher) => teacher.id}
          getOptionLabel={(teacher) => teacher.label}
          value={teacherId}
          required
          placeholder="Найдите преподавателя"
          onChange={setTeacherId}
          disabled={isSubmitting}
        />
      )}
      <p className={styles.formHint}>
        Студенту и преподавателю нужна привязка к соответствующей записи. Для администратора привязка не задаётся.
      </p>
    </form>
  );
}

interface UserRoleFormProps extends ModalFormRenderProps {
  roles: AdminRoleOption[];
  students: LinkedOption[];
  teachers: LinkedOption[];
  user: UserFormRecord;
  onSubmit: (roleId: string, linkedEntityId?: string | null) => void | Promise<void>;
}

export function UserRoleForm({
  formId,
  isSubmitting,
  registerAction,
  roles,
  students,
  teachers,
  user,
  onSubmit,
}: UserRoleFormProps) {
  const [roleId, setRoleId] = useState(user.role_id);
  const initialLinked = user.role_code === "student"
    ? user.student_id ?? ""
    : user.role_code === "teacher"
      ? user.teacher_id ?? ""
      : "";
  const [linkedId, setLinkedId] = useState(initialLinked);
  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;
  const selectedRole = roles.find((role) => role.role_id === roleId);

  useEffect(() => {
    registerAction(async () => {
      const form = formRef.current;
      if (!form) return;
      const data = new FormData(form);
      const selectedId = String(data.get("role_id") ?? "");
      const role = roles.find((item) => item.role_id === selectedId);
      const binding = role?.role_code === "student"
        ? String(data.get("student_id") ?? "") || null
        : role?.role_code === "teacher"
          ? String(data.get("teacher_id") ?? "") || null
          : null;
      await submitRef.current(selectedId, binding);
    });
  }, [registerAction, roles]);

  return (
    <form ref={formRef} id={formId} className={styles.form}>
      <p className={styles.formHint}>
        Смена роли отзовёт все активные сессии пользователя. При необходимости выбери новую привязку.
      </p>
      <ComboBox
        label="Роль"
        name="role_id"
        options={roles}
        getOptionValue={(role) => role.role_id}
        getOptionLabel={(role) => `${role.role_name} · ${role.role_code}`}
        value={roleId}
        required
        onChange={(value) => {
          const next = roles.find((role) => role.role_id === value);
          setRoleId(value);
          if (next?.role_code === "student") setLinkedId(user.student_id ?? "");
          else if (next?.role_code === "teacher") setLinkedId(user.teacher_id ?? "");
          else setLinkedId("");
        }}
        disabled={isSubmitting}
      />
      {selectedRole?.role_code === "student" && (
        <ComboBox
          label="Связанный студент"
          name="student_id"
          options={students}
          getOptionValue={(student) => student.id}
          getOptionLabel={(student) => student.label}
          value={linkedId}
          required
          placeholder="Выберите студента"
          onChange={setLinkedId}
          disabled={isSubmitting}
        />
      )}
      {selectedRole?.role_code === "teacher" && (
        <ComboBox
          label="Связанный преподаватель"
          name="teacher_id"
          options={teachers}
          getOptionValue={(teacher) => teacher.id}
          getOptionLabel={(teacher) => teacher.label}
          value={linkedId}
          required
          placeholder="Выберите преподавателя"
          onChange={setLinkedId}
          disabled={isSubmitting}
        />
      )}
    </form>
  );
}

interface PasswordFormProps extends ModalFormRenderProps {
  username: string;
  onSubmit: (password: string) => void | Promise<void>;
}

export function UserPasswordForm({
  formId,
  isSubmitting,
  registerAction,
  username,
  onSubmit,
}: PasswordFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;

  useEffect(() => {
    registerAction(async () => {
      const form = formRef.current;
      if (!form) return;
      const password = new FormData(form).get("password");
      await submitRef.current(String(password ?? ""));
    });
  }, [registerAction]);

  return (
    <form ref={formRef} id={formId} className={styles.form}>
      <p className={styles.formHint}>
        Новый пароль для <strong>{username}</strong>. После сохранения все текущие сессии будут отозваны.
      </p>
      <TextField
        label="Новый пароль"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Не менее 12 символов"
        minLength={12}
        maxLength={128}
        required
        disabled={isSubmitting}
      />
    </form>
  );
}

interface RoleCreateFormProps extends ModalFormRenderProps {
  onSubmit: (data: { role_code: string; role_name: string; description: string }) => void | Promise<void>;
}

export function RoleCreateForm({
  formId,
  isSubmitting,
  registerAction,
  onSubmit,
}: RoleCreateFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef(onSubmit);
  submitRef.current = onSubmit;

  useEffect(() => {
    registerAction(async () => {
      const form = formRef.current;
      if (!form) return;
      const data = new FormData(form);
      await submitRef.current({
        role_code: String(data.get("role_code") ?? "").trim(),
        role_name: String(data.get("role_name") ?? "").trim(),
        description: String(data.get("description") ?? "").trim(),
      });
    });
  }, [registerAction]);

  return (
    <form ref={formRef} id={formId} className={styles.form}>
      <TextField
        label="Код роли"
        name="role_code"
        placeholder="например, curator"
        maxLength={50}
        required
        hint="Латинские буквы, цифры, дефис и подчёркивание."
        disabled={isSubmitting}
      />
      <TextField
        label="Название"
        name="role_name"
        placeholder="Куратор учебной группы"
        maxLength={100}
        required
        disabled={isSubmitting}
      />
      <TextField
        label="Описание"
        name="description"
        placeholder="Для чего предназначена эта роль"
        maxLength={500}
        disabled={isSubmitting}
      />
    </form>
  );
}
