"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  changeUserRole,
  createUser,
  setUserActive,
  resetUserPassword,
} from "@/actions/access-control";

type Role = { role_id: string; role_code: string; role_name: string };
type User = {
  user_id: string;
  username: string;
  is_active: boolean;
  created_at: string;
  role_id: string;
  role_code: string;
  role_name: string;
  student_id: string | null;
  teacher_id: string | null;
  linked_name: string | null;
  active_sessions: number;
};

export default function UsersAdminView({
  initialUsers,
  roles,
  students,
  teachers,
}: {
  initialUsers: User[];
  roles: Role[];
  students: { student_id: string; label: string }[];
  teachers: { teacher_id: string; label: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [users, setUsers] = useState(initialUsers);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.role_id ?? "");
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedRole = roles.find((role) => role.role_id === roleId);
  const needsStudent = selectedRole?.role_code === "student";
  const needsTeacher = selectedRole?.role_code === "teacher";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        await createUser({
          username,
          password,
          role_id: roleId,
          student_id: needsStudent ? studentId : null,
          teacher_id: needsTeacher ? teacherId : null,
        });
        setUsername("");
        setPassword("");
        setStudentId("");
        setTeacherId("");
        setNotice("Учётная запись создана");
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Не удалось создать пользователя");
      }
    });
  }

  function updateRole(user: User, nextRoleId: string) {
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        await changeUserRole(user.user_id, nextRoleId);
        const role = roles.find((item) => item.role_id === nextRoleId);
        setUsers((current) => current.map((item) => item.user_id === user.user_id
          ? { ...item, role_id: nextRoleId, role_code: role?.role_code ?? item.role_code, role_name: role?.role_name ?? item.role_name, active_sessions: 0 }
          : item));
        setNotice(`Роль пользователя ${user.username} обновлена. Его сессии удалены.`);
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Не удалось изменить роль");
      }
    });
  }

  function changePassword(user: User) {
    const nextPassword = window.prompt("Введите новый пароль (не менее 12 символов)");
    if (!nextPassword) return;
    setError("");
    startTransition(async () => {
      try {
        await resetUserPassword(user.user_id, nextPassword);
        setNotice(`Пароль пользователя ${user.username} изменён. Его сессии удалены.`);
        setUsers((current) => current.map((item) => item.user_id === user.user_id
          ? { ...item, active_sessions: 0 }
          : item));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Не удалось изменить пароль");
      }
    });
  }

  function toggleActive(user: User) {
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        await setUserActive(user.user_id, !user.is_active);
        setUsers((current) =>
          current.map((item) =>
            item.user_id === user.user_id ? { ...item, is_active: !item.is_active } : item,
          ),
        );
        setNotice(user.is_active ? "Пользователь заблокирован, его сессии удалены" : "Пользователь активирован");
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Не удалось изменить состояние");
      }
    });
  }

  return (
    <main style={{ display: "grid", gap: 24, padding: 24 }}>
      <header>
        <h1>Управление пользователями</h1>
        <p>Создание учётных записей, назначение ролей и блокировка доступа.</p>
      </header>

      <section style={{ border: "1px solid var(--border, #ddd)", borderRadius: 12, padding: 20, display: "grid", gap: 14 }}>
        <h2>Создать пользователя</h2>
        <form onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
          <label style={{ display: "grid", gap: 5 }}>
            Логин
            <input value={username} onChange={(event) => setUsername(event.target.value)} required maxLength={80} autoComplete="off" />
          </label>
          <label style={{ display: "grid", gap: 5 }}>
            Пароль (не менее 12 символов)
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={12} maxLength={128} autoComplete="new-password" />
          </label>
          <label style={{ display: "grid", gap: 5 }}>
            Роль
            <select value={roleId} onChange={(event) => setRoleId(event.target.value)} required>
              {roles.map((role) => <option key={role.role_id} value={role.role_id}>{role.role_name} ({role.role_code})</option>)}
            </select>
          </label>
          {needsStudent && (
            <label style={{ display: "grid", gap: 5 }}>
              Студент
              <select value={studentId} onChange={(event) => setStudentId(event.target.value)} required>
                <option value="">Выберите студента</option>
                {students.map((student) => <option key={student.student_id} value={student.student_id}>{student.label}</option>)}
              </select>
            </label>
          )}
          {needsTeacher && (
            <label style={{ display: "grid", gap: 5 }}>
              Преподаватель
              <select value={teacherId} onChange={(event) => setTeacherId(event.target.value)} required>
                <option value="">Выберите преподавателя</option>
                {teachers.map((teacher) => <option key={teacher.teacher_id} value={teacher.teacher_id}>{teacher.label}</option>)}
              </select>
            </label>
          )}
          <button type="submit" disabled={pending || !roleId}>{pending ? "Сохранение..." : "Создать учётную запись"}</button>
        </form>
      </section>

      {error && <p role="alert" style={{ color: "#b42318" }}>{error}</p>}
      {notice && <p role="status">{notice}</p>}

      <section style={{ display: "grid", gap: 12 }}>
        <h2>Учётные записи ({users.length})</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
            <thead><tr>
              <th style={{ textAlign: "left", padding: 10 }}>Пользователь</th>
              <th style={{ textAlign: "left", padding: 10 }}>Привязка</th>
              <th style={{ textAlign: "left", padding: 10 }}>Роль</th>
              <th style={{ textAlign: "left", padding: 10 }}>Сессии</th>
              <th style={{ textAlign: "left", padding: 10 }}>Состояние</th>
              <th style={{ textAlign: "left", padding: 10 }}>Действие</th>
            </tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id} style={{ borderTop: "1px solid var(--border, #ddd)" }}>
                  <td style={{ padding: 10 }}>
                    <strong>{user.username}</strong>
                    <div style={{ fontSize: 12, opacity: 0.65 }}>{new Date(user.created_at).toLocaleDateString("ru-RU")}</div>
                  </td>
                  <td style={{ padding: 10 }}>{user.linked_name ?? "—"}</td>
                  <td style={{ padding: 10 }}>
                    <select value={user.role_id} disabled={pending} onChange={(event) => updateRole(user, event.target.value)}>
                      {roles.map((role) => <option key={role.role_id} value={role.role_id}>{role.role_name}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: 10 }}>{user.active_sessions}</td>
                  <td style={{ padding: 10 }}>{user.is_active ? "Активен" : "Заблокирован"}</td>
                  <td style={{ padding: 10 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button type="button" disabled={pending} onClick={() => toggleActive(user)}>
                        {user.is_active ? "Заблокировать" : "Активировать"}
                      </button>
                      <button type="button" disabled={pending} onClick={() => changePassword(user)}>Сбросить пароль</button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={6} style={{ padding: 12 }}>Пользователей пока нет</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
