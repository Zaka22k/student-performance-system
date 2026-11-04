"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Checkbox,
  ComboBox,
  Page,
  useModal,
  useToast,
} from "@ui-kit/components";
import { TrashIcon } from "@/icons";
import {
  createRole,
  deleteRole,
  replaceRolePermissions,
} from "@/actions/access-control";
import { getErrorMessage } from "@/utils";
import { RoleCreateForm, type AdminRoleOption } from "../UserForms";
import styles from "../Admin.module.css";

type Role = AdminRoleOption & {
  description: string | null;
  permission_ids: string[];
};
type Permission = {
  permission_id: string;
  permission_code: string;
  permission_name: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  home: "Главная",
  settings: "Настройки",
  grades: "Журнал успеваемости",
  dictionaries: "Справочники",
  session: "Сессия",
  analytics: "Аналитика",
  reports: "Отчёты",
  users: "Пользователи",
  roles: "Роли",
  audit: "Аудит",
};

export default function RolesAdminView({
  initialData,
}: {
  initialData: { roles: Role[]; permissions: Permission[] };
}) {
  const router = useRouter();
  const { openModal } = useModal();
  const toast = useToast();
  const [roles, setRoles] = useState(initialData.roles);
  const [activeRoleId, setActiveRoleId] = useState(initialData.roles[0]?.role_id ?? "");
  const activeRole = roles.find((role) => role.role_id === activeRoleId);
  const [selected, setSelected] = useState<string[]>(activeRole?.permission_ids ?? []);

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const permission of initialData.permissions) {
      const category = permission.permission_code.split(".")[0] ?? "other";
      const list = map.get(category) ?? [];
      list.push(permission);
      map.set(category, list);
    }
    return [...map.entries()];
  }, [initialData.permissions]);

  const originalIds = [...(activeRole?.permission_ids ?? [])].sort();
  const selectedIds = [...selected].sort();
  const isDirty =
    originalIds.length !== selectedIds.length ||
    originalIds.some((id, index) => id !== selectedIds[index]);

  const selectedRoleOption = roles.find((role) => role.role_id === activeRoleId);

  const openCreate = () => {
    openModal({
      title: "Создать роль",
      actionText: "Создать роль",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage,
      content: (form) => (
        <RoleCreateForm
          {...form}
          onSubmit={async (data) => {
            const created = await createRole(data);
            const role: Role = {
              role_id: created.role_id,
              role_code: data.role_code.toLowerCase(),
              role_name: data.role_name,
              description: data.description || null,
              permission_ids: [],
            };
            setRoles((current) => [...current, role]);
            setActiveRoleId(role.role_id);
            setSelected([]);
            toast.success("Роль создана", {
              description: "Теперь настрой разрешения для новой роли.",
            });
            router.refresh();
          }}
        />
      ),
    });
  };

  const savePermissions = () => {
    if (!activeRole || !isDirty) return;
    openModal({
      title: "Сохранить разрешения",
      actionText: "Сохранить",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage,
      content: (
        <div className={styles.form}>
          <p className="BodyTextBlockStyle">
            Будет обновлён набор разрешений роли <strong className="BodyStrongTextBlockStyle">{activeRole.role_name}</strong>.
          </p>
          <p className={styles.formHint}>
            Все действующие сессии пользователей этой роли будут удалены. После этого им потребуется войти снова.
          </p>
        </div>
      ),
      onAction: async () => {
        await replaceRolePermissions(activeRole.role_id, selected);
        setRoles((current) =>
          current.map((role) =>
            role.role_id === activeRole.role_id
              ? { ...role, permission_ids: selected }
              : role,
          ),
        );
        toast.success("Разрешения сохранены", {
          description: `Сессии пользователей роли «${activeRole.role_name}» отозваны.`,
        });
        router.refresh();
      },
    });
  };

  const confirmDelete = () => {
    if (!activeRole) return;
    openModal({
      title: "Удалить роль",
      actionText: "Удалить",
      actionAppearance: "destructive",
      errorMessage: getErrorMessage,
      content: (
        <div className={styles.form}>
          <p className="BodyTextBlockStyle">
            Удалить роль <strong className="BodyStrongTextBlockStyle">{activeRole.role_name}</strong>?
          </p>
          <p className={styles.formHint}>
            Базовые роли нельзя удалять. Роль не должна быть назначена ни одному пользователю.
          </p>
        </div>
      ),
      onAction: async () => {
        await deleteRole(activeRole.role_id);
        const remaining = roles.filter((role) => role.role_id !== activeRole.role_id);
        setRoles(remaining);
        setActiveRoleId(remaining[0]?.role_id ?? "");
        setSelected(remaining[0]?.permission_ids ?? []);
        toast.success("Роль удалена");
        router.refresh();
      },
    });
  };

  const togglePermission = (permissionId: string, checked: boolean) => {
    setSelected((current) =>
      checked
        ? [...new Set([...current, permissionId])]
        : current.filter((id) => id !== permissionId),
    );
  };

  const selectedCount = selected.length;
  const builtInRole = activeRole
    ? ["admin", "teacher", "student"].includes(activeRole.role_code)
    : true;

  return (
    <Page
      title="Роли и разрешения"
      toolbar={{
        trailing: (
          <>
            <Button onClick={openCreate}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                <span aria-hidden="true">＋</span> Новая роль
              </span>
            </Button>
            <Button
              appearance="primary"
              disabled={!activeRole || !isDirty}
              onClick={savePermissions}
            >
              Сохранить изменения
            </Button>
          </>
        ),
      }}
    >
      <div className={styles.content}>
        <div className={styles.intro}>
          <div className={styles.introCopy}>
            <span className={styles.eyebrow}>Ролевая модель доступа</span>
            <p className={styles.description}>
              Разрешения определяют действия пользователя в системе. При изменении состава прав PostgreSQL отзывает все сессии соответствующей роли.
            </p>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Ролей в системе</span>
            <strong className={styles.statValue}>{roles.length}</strong>
            <span className={styles.statHint}>Базовые и пользовательские</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Всего разрешений</span>
            <strong className={styles.statValue}>{initialData.permissions.length}</strong>
            <span className={styles.statHint}>Доступные системные действия</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>У роли выбрано</span>
            <strong className={styles.statValue}>{selectedCount}</strong>
            <span className={styles.statHint}>Разрешения текущего профиля</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Состояние редактора</span>
            <strong className={styles.statValue} style={{ fontSize: "var(--font-subtitle)" }}>
              {isDirty ? "Есть изменения" : "Сохранено"}
            </strong>
            <span className={styles.statHint}>Сверка с текущими правами в БД</span>
          </div>
        </div>

        {activeRole ? (
          <div className={styles.roleLayout}>
            <section className={styles.panel}>
              <div className={styles.roleHeader}>
                <div className={styles.roleMeta}>
                  <span className={styles.eyebrow}>Выбранная роль</span>
                  <h2 className={styles.panelTitle}>{activeRole.role_name}</h2>
                  <span className={styles.roleCode}>{activeRole.role_code}</span>
                  <p className={styles.panelDescription}>
                    {activeRole.description || "Описание для этой роли пока не задано."}
                  </p>
                </div>
                <div className={styles.form}>
                  <ComboBox
                    className={styles.roleSelector}
                    label="Переключиться на роль"
                    options={roles}
                    getOptionValue={(role) => role.role_id}
                    getOptionLabel={(role) => `${role.role_name} · ${role.role_code}`}
                    value={activeRoleId}
                    onChange={(value) => {
                      const next = roles.find((role) => role.role_id === value);
                      setActiveRoleId(value);
                      setSelected(next?.permission_ids ?? []);
                    }}
                  />
                  {selectedRoleOption && !builtInRole && (
                    <Button
                      appearance="destructive"
                      onClick={confirmDelete}
                      icon={<TrashIcon />}
                      aria-label="Удалить роль"
                      width={36}
                    />
                  )}
                </div>
              </div>
            </section>

            <div className={styles.permissionGroups}>
              {grouped.map(([category, permissions]) => {
                const groupSelected = permissions.filter((permission) =>
                  selected.includes(permission.permission_id),
                ).length;
                const allChecked = groupSelected === permissions.length;
                const someChecked = groupSelected > 0 && !allChecked;
                return (
                  <section key={category} className={styles.permissionGroup}>
                    <header className={styles.permissionGroupHeader}>
                      <h3 className={styles.permissionGroupTitle}>
                        {CATEGORY_LABELS[category] ?? category}
                      </h3>
                      <span className={styles.permissionCount}>
                        {groupSelected} / {permissions.length}
                      </span>
                    </header>
                    <div className={styles.permissionList}>
                      <div className={styles.permissionItem}>
                        <div className={styles.permissionText}>
                          <span className={styles.permissionName}>Все разрешения раздела</span>
                          <span className={styles.permissionCode}>Выбрать группу целиком</span>
                        </div>
                        <Checkbox
                          aria-label={`Выбрать все разрешения раздела ${category}`}
                          checked={allChecked}
                          indeterminate={someChecked}
                          onChange={(event) => {
                            const ids = permissions.map((permission) => permission.permission_id);
                            setSelected((current) => {
                              const next = new Set(current);
                              if (event.target.checked) ids.forEach((id) => next.add(id));
                              else ids.forEach((id) => next.delete(id));
                              return [...next];
                            });
                          }}
                        />
                      </div>
                      {permissions.map((permission) => (
                        <div key={permission.permission_id} className={styles.permissionItem}>
                          <div className={styles.permissionText}>
                            <span className={styles.permissionName}>{permission.permission_name}</span>
                            <span className={styles.permissionCode}>{permission.permission_code}</span>
                          </div>
                          <Checkbox
                            aria-label={permission.permission_name}
                            checked={selected.includes(permission.permission_id)}
                            onChange={(event) =>
                              togglePermission(permission.permission_id, event.target.checked)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            {isDirty && (
              <div className={styles.formHint}>
                Изменения ещё не сохранены. После сохранения пользователям роли потребуется войти повторно.
              </div>
            )}
          </div>
        ) : (
          <section className={styles.panel}>
            <div className={styles.emptyState}>
              <strong>Ролей пока нет</strong>
              <span>Создай первую роль, чтобы настроить для неё разрешения.</span>
            </div>
          </section>
        )}
      </div>
    </Page>
  );
}
