"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useModal, useToast } from "@ui-kit/components";
import {
  changeUserRole,
  createUser,
  deleteUser,
  resetUserPassword,
  setUserActive,
} from "@/actions/access-control";
import { getErrorMessage } from "@/utils";
import {
  UserCreateForm,
  UserPasswordForm,
  UserRoleForm,
  type AdminRoleOption,
  type LinkedOption,
} from "../UserForms";

export type AdminUser = {
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

interface UseUsersPageOptions {
  initialUsers: AdminUser[];
  roles: AdminRoleOption[];
  students: LinkedOption[];
  teachers: LinkedOption[];
}

export function useUsersPage({
  initialUsers,
  roles,
  students,
  teachers,
}: UseUsersPageOptions) {
  const router = useRouter();
  const { openModal } = useModal();
  const toast = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru");
    if (!normalizedQuery) return users;

    return users.filter((user) =>
      [user.username, user.role_name, user.role_code, user.linked_name ?? ""]
        .join(" ")
        .toLocaleLowerCase("ru")
        .includes(normalizedQuery),
    );
  }, [query, users]);

  const activeCount = users.filter((user) => user.is_active).length;
  const blockedCount = users.length - activeCount;
  const sessionCount = users.reduce(
    (total, user) => total + user.active_sessions,
    0,
  );

  const openCreate = () => {
    openModal({
      title: "Новая учётная запись",
      actionText: "Создать пользователя",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage,
      content: (form) => (
        <UserCreateForm
          {...form}
          roles={roles}
          students={students}
          teachers={teachers}
          onSubmit={async (data) => {
            const created = await createUser(data);
            const role = roles.find((item) => item.role_id === data.role_id);
            const linkedName = data.student_id
              ? students.find((item) => item.id === data.student_id)?.label ?? null
              : data.teacher_id
                ? teachers.find((item) => item.id === data.teacher_id)?.label ?? null
                : null;

            const nextUser: AdminUser = {
              user_id: created.user_id,
              username: data.username,
              is_active: true,
              created_at: new Date().toISOString(),
              role_id: data.role_id,
              role_code: role?.role_code ?? "",
              role_name: role?.role_name ?? "",
              student_id: data.student_id,
              teacher_id: data.teacher_id,
              linked_name: linkedName,
              active_sessions: 0,
            };

            setUsers((current) =>
              [...current, nextUser].sort((a, b) =>
                a.username.localeCompare(b.username, "ru"),
              ),
            );
            toast.success("Пользователь создан", {
              description: `Учётная запись «${data.username}» добавлена в систему.`,
            });
            router.refresh();
          }}
        />
      ),
    });
  };

  const openChangeRole = (user: AdminUser) => {
    openModal({
      title: `Роль пользователя «${user.username}»`,
      actionText: "Сохранить роль",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage,
      content: (form) => (
        <UserRoleForm
          {...form}
          user={user}
          roles={roles}
          students={students}
          teachers={teachers}
          onSubmit={async (roleId, linkedEntityId) => {
            await changeUserRole(user.user_id, roleId, linkedEntityId);

            const role = roles.find((item) => item.role_id === roleId);
            const studentId =
              role?.role_code === "student" ? linkedEntityId ?? null : null;
            const teacherId =
              role?.role_code === "teacher" ? linkedEntityId ?? null : null;
            const linkedName = studentId
              ? students.find((item) => item.id === studentId)?.label ?? null
              : teacherId
                ? teachers.find((item) => item.id === teacherId)?.label ?? null
                : null;

            setUsers((current) =>
              current.map((item) =>
                item.user_id === user.user_id
                  ? {
                      ...item,
                      role_id: roleId,
                      role_code: role?.role_code ?? item.role_code,
                      role_name: role?.role_name ?? item.role_name,
                      student_id:
                        role?.role_code === "student"
                          ? studentId
                          : role?.role_code === "admin" ||
                              role?.role_code === "teacher"
                            ? null
                            : item.student_id,
                      teacher_id:
                        role?.role_code === "teacher"
                          ? teacherId
                          : role?.role_code === "admin" ||
                              role?.role_code === "student"
                            ? null
                            : item.teacher_id,
                      linked_name:
                        role?.role_code === "admin"
                          ? null
                          : role?.role_code === "student" ||
                              role?.role_code === "teacher"
                            ? linkedName
                            : item.linked_name,
                      active_sessions: 0,
                    }
                  : item,
              ),
            );

            toast.success("Роль обновлена", {
              description: `Сессии пользователя «${user.username}» отозваны.`,
            });
            router.refresh();
          }}
        />
      ),
    });
  };

  const openResetPassword = (user: AdminUser) => {
    openModal({
      title: "Сброс пароля",
      actionText: "Изменить пароль",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage,
      content: (form) => (
        <UserPasswordForm
          {...form}
          username={user.username}
          onSubmit={async (password) => {
            await resetUserPassword(user.user_id, password);
            setUsers((current) =>
              current.map((item) =>
                item.user_id === user.user_id
                  ? { ...item, active_sessions: 0 }
                  : item,
              ),
            );
            toast.success("Пароль изменён", {
              description: `Все активные сессии «${user.username}» отозваны.`,
            });
            router.refresh();
          }}
        />
      ),
    });
  };

  const openToggleActive = (user: AdminUser) => {
    const nextActive = !user.is_active;

    openModal({
      title: nextActive
        ? "Активировать пользователя"
        : "Заблокировать пользователя",
      actionText: nextActive ? "Активировать" : "Заблокировать",
      actionAppearance: nextActive ? "primary" : "destructive",
      errorMessage: getErrorMessage,
      content: (
        <p className="BodyTextBlockStyle">
          {nextActive ? (
            <>
              Учётная запись{" "}
              <strong className="BodyStrongTextBlockStyle">
                {user.username}
              </strong>{" "}
              снова сможет входить в систему.
            </>
          ) : (
            <>
              Пользователь{" "}
              <strong className="BodyStrongTextBlockStyle">
                {user.username}
              </strong>{" "}
              потеряет доступ, а все его активные сессии будут удалены.
            </>
          )}
        </p>
      ),
      onAction: async () => {
        await setUserActive(user.user_id, nextActive);
        setUsers((current) =>
          current.map((item) =>
            item.user_id === user.user_id
              ? { ...item, is_active: nextActive, active_sessions: 0 }
              : item,
          ),
        );
        toast.success(
          nextActive
            ? "Пользователь активирован"
            : "Пользователь заблокирован",
        );
        router.refresh();
      },
    });
  };

  const openDeleteUser = (user: AdminUser) => {
    openModal({
      title: "Удалить пользователя",
      actionText: "Удалить пользователя",
      actionAppearance: "destructive",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage,
      content: (
        <p className="BodyTextBlockStyle">
          Учётная запись{" "}
          <strong className="BodyStrongTextBlockStyle">{user.username}</strong>{" "}
          будет удалена вместе со всеми активными сессиями. Связанная карточка
          студента или преподавателя и записи журнала аудита сохранятся.
        </p>
      ),
      onAction: async () => {
        await deleteUser(user.user_id);
        setUsers((current) =>
          current.filter((item) => item.user_id !== user.user_id),
        );
        toast.success("Пользователь удалён", {
          description: \`Учётная запись «\${user.username}» удалена.\`,
        });
        router.refresh();
      },
    });
  };

  return {
    users,
    filteredUsers,
    query,
    setQuery,
    activeCount,
    blockedCount,
    sessionCount,
    openCreate,
    openChangeRole,
    openResetPassword,
    openToggleActive,
    openDeleteUser,
  };
}
