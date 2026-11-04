"use client";

import { useMemo } from "react";
import {
  Button,
  DataGrid,
  Page,
  SearchField,
  type DataGridColumn,
} from "@ui-kit/components";
import { EditIcon, PlusIcon } from "@/icons";
import type { AdminRoleOption, LinkedOption } from "../UserForms";
import { useUsersPage, type AdminUser } from "./useUsersPage";
import styles from "../Admin.module.css";

interface UsersPageViewProps {
  initialUsers: AdminUser[];
  roles: AdminRoleOption[];
  students: LinkedOption[];
  teachers: LinkedOption[];
}

export default function UsersAdminView({
  initialUsers,
  roles,
  students,
  teachers,
}: UsersPageViewProps) {
  const page = useUsersPage({ initialUsers, roles, students, teachers });

  const columns = useMemo<DataGridColumn<AdminUser>[]>(() => [
    {
      id: "username",
      header: "Учётная запись",
      width: 220,
      minWidth: 170,
      cell: (user) => (
        <div className={styles.cellMain}>
          <span className={styles.cellTitle}>{user.username}</span>
          <span className={styles.cellMeta}>
            Создана {new Date(user.created_at).toLocaleDateString("ru-RU")}
          </span>
        </div>
      ),
    },
    {
      id: "role",
      header: "Роль",
      width: 190,
      cell: (user) => (
        <div className={styles.cellMain}>
          <span className={styles.cellTitle}>{user.role_name}</span>
          <span className={styles.cellMeta}>{user.role_code}</span>
        </div>
      ),
    },
    {
      id: "binding",
      header: "Связанная запись",
      width: 270,
      cell: (user) =>
        user.linked_name ?? (
          <span className={styles.cellMeta}>Без привязки</span>
        ),
    },
    {
      id: "sessions",
      header: "Активные сессии",
      width: 135,
      align: "center",
      cell: (user) => String(user.active_sessions),
    },
    {
      id: "status",
      header: "Состояние",
      width: 135,
      cell: (user) => (
        <span
          className={`${styles.status} ${user.is_active ? styles.statusActive : styles.statusInactive}`}
        >
          {user.is_active ? "Активен" : "Заблокирован"}
        </span>
      ),
    },
  ], []);

  return (
    <Page
      title="Пользователи"
      toolbar={{
        trailing: (
          <>
            <SearchField
              className={styles.toolbarSearch}
              placeholder="Поиск пользователей"
              aria-label="Поиск по логину, роли или привязке"
              value={page.query}
              onChange={(event) => page.setQuery(event.target.value)}
            />
            <Button
              appearance="primary"
              icon={<PlusIcon />}
              onClick={page.openCreate}
            >
              Создать
            </Button>
          </>
        ),
      }}
    >
      <DataGrid
        striped
        aria-label="Учётные записи пользователей"
        rows={page.filteredUsers}
        columns={columns}
        getRowId={(user) => user.user_id}
        resetKey={page.query}
        emptyContent="Пользователи не найдены. Измени поисковый запрос или создай новую учётную запись."
        onRowActivate={page.openChangeRole}
        rowMenu={({ row }) => [
          {
            id: "change-role",
            label: "Изменить роль и привязку",
            icon: <EditIcon />,
            onSelect: () => page.openChangeRole(row),
          },
          {
            id: "reset-password",
            label: "Сбросить пароль",
            onSelect: () => page.openResetPassword(row),
          },
          { type: "separator" },
          {
            id: "toggle-active",
            label: row.is_active ? "Заблокировать" : "Активировать",
            danger: row.is_active,
            onSelect: () => page.openToggleActive(row),
          },
        ]}
      />
    </Page>
  );
}
