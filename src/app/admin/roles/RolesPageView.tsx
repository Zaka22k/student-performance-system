"use client";

import { Button, Checkbox, ComboBox, Page } from "@ui-kit/components";
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

export default function RolesPageView({ initialData }: RolesPageViewProps) {
  const page = useRolesPage({ initialData });

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
      <div className={styles.roleLayout}>
        {page.activeRole ? (
          <>
            <section className={styles.roleHeader}>
              <div className={styles.roleMeta}>
                <h2 className="SubtitleTextBlockStyle">
                  {page.activeRole.role_name}
                </h2>
                <span className={styles.roleCode}>
                  {page.activeRole.role_code}
                </span>
                <p className={styles.description}>
                  {page.activeRole.description ||
                    "Описание для этой роли пока не задано."}
                </p>
              </div>

              <div className={styles.roleControls}>
                <ComboBox
                  className={styles.roleSelector}
                  label="Выбранная роль"
                  options={page.roles}
                  getOptionValue={(role) => role.role_id}
                  getOptionLabel={(role) =>
                    `${role.role_name} · ${role.role_code}`
                  }
                  value={page.activeRoleId}
                  onChange={(value, option) => {
                    // ComboBox сообщает null, пока пользователь редактирует текст.
                    // Меняем роль только при выборе существующей записи.
                    if (option) page.changeActiveRole(option.role_id);
                  }}
                />
                {!page.builtInRole && (
                  <Button
                    appearance="destructive"
                    icon={<TrashIcon />}
                    aria-label="Удалить роль"
                    onClick={page.confirmDelete}
                  />
                )}
              </div>
            </section>

            <div className={styles.permissionSummary}>
              <span>
                Выбрано разрешений: {page.selectedCount} из{" "}
                {page.permissions.length}
              </span>
              {page.isDirty && (
                <span className={styles.unsaved}>
                  Есть несохранённые изменения
                </span>
              )}
            </div>

            <div className={styles.permissionGroups}>
              {page.grouped.map(([category, permissions]) => {
                const groupSelected = permissions.filter((permission) =>
                  page.selected.includes(permission.permission_id),
                ).length;
                const allChecked = groupSelected === permissions.length;
                const someChecked = groupSelected > 0 && !allChecked;
                const permissionIds = permissions.map(
                  (permission) => permission.permission_id,
                );

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
                          <span className={styles.permissionName}>
                            Все разрешения раздела
                          </span>
                          <span className={styles.permissionCode}>
                            Выбрать группу целиком
                          </span>
                        </div>
                        <Checkbox
                          aria-label={`Выбрать все разрешения раздела ${category}`}
                          checked={allChecked}
                          indeterminate={someChecked}
                          onChange={(event) =>
                            page.togglePermissionGroup(
                              permissionIds,
                              event.target.checked,
                            )
                          }
                        />
                      </div>

                      {permissions.map((permission) => (
                        <div
                          key={permission.permission_id}
                          className={styles.permissionItem}
                        >
                          <div className={styles.permissionText}>
                            <span className={styles.permissionName}>
                              {permission.permission_name}
                            </span>
                            <span className={styles.permissionCode}>
                              {permission.permission_code}
                            </span>
                          </div>
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
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            {page.isDirty && (
              <p className={styles.formHint}>
                При сохранении набора прав активные сессии пользователей этой
                роли будут отозваны. Им потребуется войти повторно.
              </p>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <strong>Ролей пока нет</strong>
            <span>Создай первую роль, чтобы настроить для неё разрешения.</span>
          </div>
        )}
      </div>
    </Page>
  );
}
