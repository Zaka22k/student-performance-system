"use client";

import { Button, Checkbox, Page } from "@ui-kit/components";
import { PlusIcon, TrashIcon, CheckIcon } from "@/icons";
import type { AdminPermission } from "./useRolesPage";
import { useRolesPage } from "./useRolesPage";
import styles from "../Admin.module.css";

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

interface RolesPageViewProps {
  initialData: {
    roles: Array<{
      role_id: string;
      role_code: string;
      role_name: string;
      description: string | null;
      permission_ids: string[];
    }>;
    permissions: AdminPermission[];
  };
}

/** «1 разрешение», «2 разрешения», «5 разрешений». */
function permissionsWord(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} разрешение`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return `${n} разрешения`;
  return `${n} разрешений`;
}

export default function RolesPageView({ initialData }: RolesPageViewProps) {
  const page = useRolesPage({ initialData });
  const total = page.permissions.length;

  return (
    <Page
      title="Роли и разрешения"
      toolbar={{
        trailing: (
          <>
            <Button
              icon={<PlusIcon />}
              aria-label="Новая роль"
              onClick={page.openCreate}
            />
            <Button
              icon={<CheckIcon />}
              appearance="primary"
              disabled={!page.activeRole || !page.isDirty}
              onClick={page.savePermissions}
              aria-label="Сохранить изменения"
            />
          </>
        ),
      }}
    >
      <div className={styles.rolesWrap}>
        {page.activeRole ? (
          <div className={styles.roles}>
            <ul className={styles.rail} aria-label="Роли">
              {page.roles.map((role) => {
                const isActive = role.role_id === page.activeRoleId;
                const count = isActive
                  ? page.selectedCount
                  : role.permission_ids.length;
                return (
                  <li key={role.role_id}>
                    <button
                      type="button"
                      className={styles.roleItem}
                      aria-current={isActive}
                      onClick={() => page.changeActiveRole(role.role_id)}
                    >
                      <span className={styles.roleItemName}>
                        {role.role_name}
                      </span>
                      <span className={styles.roleItemMeta}>
                        {permissionsWord(count)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className={styles.detail}>
              <section className={styles.roleHead}>
                <div>
                  <h2 className={`TitleTextBlockStyle ${styles.roleTitle}`}>
                    {page.activeRole.role_name}
                  </h2>
                  <p className={styles.roleCodeLine}>
                    <span className={styles.code}>
                      {page.activeRole.role_code}
                    </span>
                    {page.builtInRole && (
                      <span className={styles.badge}>Встроенная</span>
                    )}
                  </p>
                  <p className={styles.description}>
                    {page.activeRole.description ||
                      "Описание для этой роли пока не задано."}
                  </p>
                </div>
                {!page.builtInRole && (
                  <Button
                    appearance="destructive"
                    icon={<TrashIcon />}
                    onClick={page.confirmDelete}
                  >
                    Удалить роль
                  </Button>
                )}
              </section>

              {page.isDirty && (
                <div className={styles.notice} role="status">
                  <p className={styles.noticeText}>
                    Есть несохранённые изменения. После сохранения активные
                    сессии пользователей этой роли будут отозваны, им придётся
                    войти заново.
                  </p>
                  <Button
                    appearance="primary"
                    icon={<CheckIcon />}
                    onClick={page.savePermissions}
                  >
                    Сохранить изменения
                  </Button>
                </div>
              )}

              <div className={styles.coverage}>
                <div className={styles.coverageText}>
                  <span>Выбрано разрешений</span>
                  <span>
                    {page.selectedCount} из {total}
                  </span>
                </div>
                <div className={styles.meter} aria-hidden="true">
                  <span
                    className={styles.meterFill}
                    style={{
                      width: `${total ? (page.selectedCount / total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className={styles.groups}>
                {page.grouped.map(([category, permissions]) => {
                  const label = CATEGORY_LABELS[category] ?? category;
                  const groupSelected = permissions.filter((permission) =>
                    page.selected.includes(permission.permission_id),
                  ).length;
                  const allChecked = groupSelected === permissions.length;
                  const someChecked = groupSelected > 0 && !allChecked;
                  const permissionIds = permissions.map(
                    (permission) => permission.permission_id,
                  );

                  return (
                    <section key={category} className={styles.group}>
                      <header className={styles.groupHead}>
                        <Checkbox
                          aria-label={`Выбрать все разрешения раздела «${label}»`}
                          checked={allChecked}
                          indeterminate={someChecked}
                          onChange={(event) =>
                            page.togglePermissionGroup(
                              permissionIds,
                              event.target.checked,
                            )
                          }
                        />
                        <h3 className={styles.groupTitle}>{label}</h3>
                        <span className={styles.groupCount}>
                          {groupSelected} / {permissions.length}
                        </span>
                      </header>

                      <ul className={styles.perms}>
                        {permissions.map((permission) => (
                          <li
                            key={permission.permission_id}
                            className={styles.perm}
                          >
                            <span className={styles.permLabel}>
                              <span className={styles.permName}>
                                {permission.permission_name}
                              </span>
                              <span className={styles.permCode}>
                                {permission.permission_code}
                              </span>
                            </span>
                            <Checkbox
                              aria-label={permission.permission_name}
                              checked={page.selected.includes(
                                permission.permission_id,
                              )}
                              onChange={(event) =>
                                page.togglePermission(
                                  permission.permission_id,
                                  event.target.checked,
                                )
                              }
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>Ролей пока нет</h2>
            <p className={styles.emptyText}>
              Создайте первую роль, чтобы настроить для неё разрешения.
            </p>
            <Button
              appearance="primary"
              icon={<PlusIcon />}
              onClick={page.openCreate}
            >
              Новая роль
            </Button>
          </div>
        )}
      </div>
    </Page>
  );
}
