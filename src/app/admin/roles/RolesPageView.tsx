"use client";

import { Button, Checkbox, ComboBox, Page } from "@ui-kit/components";
import { PlusIcon, TrashIcon } from "@/icons";
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
  if (mod10 === 1 && mod100 !== 11) return n + " разрешение";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return n + " разрешения";
  }
  return n + " разрешений";
}

export default function RolesPageView({ initialData }: RolesPageViewProps) {
  const page = useRolesPage({ initialData });
  const total = page.permissions.length;
  const percent = total
    ? Math.round((page.selectedCount / total) * 100)
    : 0;

  return (
    <Page
      title="Роли и разрешения"
      toolbar={{
        trailing: (
          <div className={styles.toolbarActions}>
            <Button
              icon={<PlusIcon />}
              aria-label="Новая роль"
              title="Новая роль"
              onClick={page.openCreate}
            />
            <Button
              appearance="primary"
              disabled={!page.activeRole || !page.isDirty}
              onClick={page.savePermissions}
            >
              Сохранить
            </Button>
          </div>
        ),
      }}
    >
      <div className={styles.rolesWrap}>
        {page.activeRole ? (
          <div className={styles.roles}>
            <section className={styles.roleSelector}>
              <div className={styles.roleSelectorInfo}>
                <h2 className={styles.roleSelectorTitle}>
                  Роль для настройки
                </h2>
                <p className={styles.roleSelectorHint}>
                  Выберите роль, чтобы просмотреть и изменить её разрешения.
                </p>
              </div>

              <div className={styles.roleSelectorField}>
                <ComboBox
                  label="Активная роль"
                  options={page.roles}
                  value={page.activeRoleId}
                  getOptionValue={(role) => role.role_id}
                  getOptionLabel={(role) =>
                    role.role_name + " · " + role.role_code
                  }
                  placeholder="Найти роль…"
                  onChange={(_value, option) => {
                    if (option) page.changeActiveRole(option.role_id);
                  }}
                  style={{ width: "100%" }}
                />
                <span className={styles.roleSelectorMeta}>
                  {permissionsWord(page.roles.length)} в системе
                </span>
              </div>
            </section>

            <div className={styles.detail}>
              <section className={styles.roleHead}>
                <div className={styles.roleHeadInfo}>
                  <div className={styles.roleTitleRow}>
                    <h2 className={"TitleTextBlockStyle " + styles.roleTitle}>
                      {page.activeRole.role_name}
                    </h2>
                    <span className={styles.code}>
                      {page.activeRole.role_code}
                    </span>
                    {page.builtInRole && (
                      <span className={styles.badge}>Системная</span>
                    )}
                  </div>
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
                  <span className={styles.noticeMark} aria-hidden="true" />
                  <p className={styles.noticeText}>
                    Есть несохранённые изменения. После сохранения активные
                    сессии пользователей этой роли будут отозваны.
                  </p>
                </div>
              )}

              <section className={styles.coverage} aria-label="Охват разрешений">
                <div className={styles.coverageText}>
                  <span>Выбрано разрешений</span>
                  <strong>
                    {page.selectedCount} из {total} ({percent}%)
                  </strong>
                </div>
                <div className={styles.meter} aria-hidden="true">
                  <span
                    className={styles.meterFill}
                    style={{ width: percent + "%" }}
                  />
                </div>
              </section>

              <div className={styles.groups}>
                {page.grouped.map(([category, permissions]) => {
                  const label = CATEGORY_LABELS[category] ?? category;
                  const groupSelected = permissions.filter((permission) =>
                    page.selected.includes(permission.permission_id),
                  ).length;
                  const allChecked = groupSelected === permissions.length;
                  const someChecked =
                    groupSelected > 0 && !allChecked;
                  const permissionIds = permissions.map(
                    (permission) => permission.permission_id,
                  );

                  return (
                    <section key={category} className={styles.group}>
                      <header className={styles.groupHead}>
                        <Checkbox
                          aria-label={
                            "Выбрать все разрешения раздела «" +
                            label +
                            "»"
                          }
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
                        <span
                          className={styles.groupCount}
                          data-active={groupSelected > 0 ? "true" : undefined}
                        >
                          {groupSelected}/{permissions.length}
                        </span>
                      </header>

                      <ul className={styles.perms}>
                        {permissions.map((permission) => {
                          const checked = page.selected.includes(
                            permission.permission_id,
                          );

                          return (
                            <li
                              key={permission.permission_id}
                              className={styles.permItem}
                            >
                              <label
                                className={styles.perm}
                                data-checked={checked ? "true" : undefined}
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
                                  checked={checked}
                                  onChange={(event) =>
                                    page.togglePermission(
                                      permission.permission_id,
                                      event.target.checked,
                                    )
                                  }
                                />
                              </label>
                            </li>
                          );
                        })}
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
            <Button appearance="primary" onClick={page.openCreate}>
              Новая роль
            </Button>
          </div>
        )}
      </div>
    </Page>
  );
}
