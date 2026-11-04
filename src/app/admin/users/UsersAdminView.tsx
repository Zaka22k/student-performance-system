"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  DataGrid,
  Page,
  SearchField,
  useModal,
  useToast,
  type DataGridColumn,
} from "@ui-kit/components";
import { EditIcon, PlusIcon } from "@/icons";
import {
  changeUserRole,
  createUser,
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
import styles from "../Admin.module.css";

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
  roles: AdminRoleOption[];
  students: LinkedOption[];
  teachers: LinkedOption[];
}) {
  const router = useRouter();
  const { openModal } = useModal();
  const toast = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("ru");
    if (!q) return users;
    return users.filter((user) =>
      [user.username, user.role_name, user.role_code, user.linked_name ?? ""]
        .join(" ")
        .toLocaleLowerCase("ru")
        .includes(q),
    );
  }, [query, users]);

  const activeCount = users.filter((user) => user.is_active).length;
  const blockedCount = users.length - activeCount;
  const sessionCount = users.reduce((sum, user) => sum + user.active_sessions, 0);

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
            const nextUser: User = {
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
              [...current, nextUser].sort((a, b) => a.username.localeCompare(b.username, "ru")),
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

  const openChangeRole = (user: User) => {
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
            const studentId = role?.role_code === "student" ? linkedEntityId ?? null : null;
            const teacherId = role?.role_code === "teacher" ? linkedEntityId ?? null : null;
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
                      student_id: role?.role_code === "student" ? studentId : role?.role_code === "admin" || role?.role_code === "teacher" ? null : item.student_id,
                      teacher_id: role?.role_code === "teacher" ? teacherId : role?.role_code === "admin" || role?.role_code === "student" ? null : item.teacher_id,
                      linked_name: role?.role_code === "admin" || role?.role_code === "custom" ? null : linkedName ?? item.linked_name,
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

  const openResetPassword = (user: User) => {
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

  const openToggleActive = (user: User) => {
    const nextActive = !user.is_active;
    openModal({
      title: nextActive ? "Активировать пользователя" : "Заблокировать пользователя",
      actionText: nextActive ? "Активировать" : "Заблокировать",
      actionAppearance: nextActive ? "primary" : "destructive",
      errorMessage: getErrorMessage,
      content: (
        <p className="BodyTextBlockStyle">
          {nextActive
            ? <>Учётная запись <strong className="BodyStrongTextBlockStyle">{user.username}</strong> снова сможет входить в систему.</>
            : <>Пользователь <strong className="BodyStrongTextBlockStyle">{user.username}</strong> потеряет доступ, а все его активные сессии будут удалены.</>}
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
        toast.success(nextActive ? "Пользователь активирован" : "Пользователь заблокирован");
        router.refresh();
      },
    });
  };

  const columns = useMemo<DataGridColumn<User>[]>(() => [
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
      cell: (user) => user.linked_name ?? <span className={styles.cellMeta}>Без привязки</span>,
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
        <span className={`${styles.status} ${user.is_active ? styles.statusActive : styles.statusInactive}`}>
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
              width="min(30vw, 320px)"
              placeholder="Поиск пользователей"
              aria-label="Поиск по логину, роли или привязке"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button appearance="primary" onClick={openCreate}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <PlusIcon size={16} /> Создать
              </span>
            </Button>
          </>
        ),
      }}
    >
      <div className={styles.content}>
        <div className={styles.intro}>
          <div className={styles.introCopy}>
            <span className={styles.eyebrow}>Контроль доступа</span>
            <p className={styles.description}>
              Учётные записи системы, назначенные роли и привязки к карточкам студентов или преподавателей.
              При смене роли, пароля или состояния активные сессии автоматически отзываются.
            </p>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Всего пользователей</span>
            <strong className={styles.statValue}>{users.length}</strong>
            <span className={styles.statHint}>Учётные записи в системе</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Активные</span>
            <strong className={styles.statValue}>{activeCount}</strong>
            <span className={styles.statHint}>Могут проходить авторизацию</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Заблокированные</span>
            <strong className={styles.statValue}>{blockedCount}</strong>
            <span className={styles.statHint}>Вход в систему запрещён</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Текущие сессии</span>
            <strong className={styles.statValue}>{sessionCount}</strong>
            <span className={styles.statHint}>Серверные сессии в БД</span>
          </div>
        </div>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Список учётных записей</h2>
              <p className={styles.panelDescription}>
                Найдено: {filteredUsers.length} из {users.length}. Двойной клик по строке открывает смену роли.
              </p>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <DataGrid
              striped
              aria-label="Учётные записи пользователей"
              rows={filteredUsers}
              columns={columns}
              getRowId={(user) => user.user_id}
              resetKey={query}
              emptyContent={
                <div className={styles.emptyState}>
                  <strong>Пользователи не найдены</strong>
                  <span>Измени поисковый запрос или создай новую учётную запись.</span>
                </div>
              }
              onRowActivate={openChangeRole}
              rowMenu={({ row }) => [
                {
                  id: "change-role",
                  label: "Изменить роль и привязку",
                  icon: <EditIcon />,
                  onSelect: () => openChangeRole(row),
                },
                {
                  id: "reset-password",
                  label: "Сбросить пароль",
                  onSelect: () => openResetPassword(row),
                },
                { type: "separator" },
                {
                  id: "toggle-active",
                  label: row.is_active ? "Заблокировать" : "Активировать",
                  danger: row.is_active,
                  onSelect: () => openToggleActive(row),
                },
              ]}
            />
          </div>
        </section>
      </div>
    </Page>
  );
}
