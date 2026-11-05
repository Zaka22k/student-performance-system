"use client";

import { createElement as h } from "react";
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
  const percent = total ? Math.round((page.selectedCount / total) * 100) : 0;

  return h(
    Page,
    {
      title: "Роли и разрешения",
      toolbar: {
        trailing: h(
          "div",
          { className: styles.toolbarActions },
          h(Button, {
            icon: h(PlusIcon),
            "aria-label": "Новая роль",
            onClick: page.openCreate,
          }),
          h(Button, {
            icon: h(CheckIcon),
            appearance: "primary",
            disabled: !page.activeRole || !page.isDirty,
            onClick: page.savePermissions,
            "aria-label": "Сохранить изменения",
          }),
        ),
      },
    },
    h(
      "div",
      { className: styles.rolesWrap },
      page.activeRole
        ? h(
            "div",
            { className: styles.roles },
            // Левая колонка со списком ролей
            h(
              "ul",
              { className: styles.rail, "aria-label": "Роли" },
              page.roles.map((role) => {
                const isActive = role.role_id === page.activeRoleId;
                const count = isActive
                  ? page.selectedCount
                  : role.permission_ids.length;

                return h(
                  "li",
                  { key: role.role_id },
                  h(
                    "button",
                    {
                      type: "button",
                      className: styles.roleItem,
                      "aria-current": isActive ? "true" : undefined,
                      onClick: () => page.changeActiveRole(role.role_id),
                    },
                    h(
                      "div",
                      { className: styles.roleItemHeader },
                      h(
                        "span",
                        { className: styles.roleItemName },
                        role.role_name,
                      ),
                      h(
                        "span",
                        { className: styles.roleItemCode },
                        role.role_code,
                      ),
                    ),
                    h(
                      "span",
                      { className: styles.roleItemMeta },
                      permissionsWord(count),
                    ),
                  ),
                );
              }),
            ),
            // Правая детальная панель
            h(
              "div",
              { className: styles.detail },
              // Карточка заголовка роли
              h(
                "section",
                { className: styles.roleHead },
                h(
                  "div",
                  { className: styles.roleHeadInfo },
                  h(
                    "div",
                    { className: styles.roleTitleRow },
                    h(
                      "h2",
                      { className: `TitleTextBlockStyle ${styles.roleTitle}` },
                      page.activeRole.role_name,
                    ),
                    h(
                      "span",
                      { className: styles.code },
                      page.activeRole.role_code,
                    ),
                    page.builtInRole
                      ? h("span", { className: styles.badge }, "Системная")
                      : null,
                  ),
                  h(
                    "p",
                    { className: styles.description },
                    page.activeRole.description ||
                      "Описание для этой роли пока не задано.",
                  ),
                ),
                !page.builtInRole
                  ? h(
                      Button,
                      {
                        appearance: "destructive",
                        icon: h(TrashIcon),
                        onClick: page.confirmDelete,
                      },
                      "Удалить роль",
                    )
                  : null,
              ),

              // Плашка несохранённых изменений
              page.isDirty
                ? h(
                    "div",
                    { className: styles.notice, role: "status" },
                    h(
                      "p",
                      { className: styles.noticeText },
                      "Есть несохранённые изменения. После сохранения активные сессии пользователей этой роли будут отозваны.",
                    ),
                    h(
                      Button,
                      {
                        appearance: "primary",
                        icon: h(CheckIcon),
                        onClick: page.savePermissions,
                      },
                      "Сохранить изменения",
                    ),
                  )
                : null,

              // Полоса охвата разрешений
              h(
                "div",
                { className: styles.coverage },
                h(
                  "div",
                  { className: styles.coverageText },
                  h(
                    "span",
                    { className: styles.coverageLabel },
                    "Охват разрешений роли",
                  ),
                  h(
                    "span",
                    { className: styles.coverageValue },
                    `${page.selectedCount} из ${total} (${percent}%)`,
                  ),
                ),
                h(
                  "div",
                  { className: styles.meter, "aria-hidden": "true" },
                  h("span", {
                    className: styles.meterFill,
                    style: { width: `${percent}%` },
                  }),
                ),
              ),

              // Карточки групп разрешений
              h(
                "div",
                { className: styles.groups },
                page.grouped.map(([category, permissions]) => {
                  const label = CATEGORY_LABELS[category] ?? category;
                  const groupSelected = permissions.filter((permission) =>
                    page.selected.includes(permission.permission_id),
                  ).length;
                  const allChecked = groupSelected === permissions.length;
                  const someChecked = groupSelected > 0 && !allChecked;
                  const permissionIds = permissions.map(
                    (permission) => permission.permission_id,
                  );

                  return h(
                    "section",
                    { key: category, className: styles.group },
                    h(
                      "header",
                      { className: styles.groupHead },
                      h(Checkbox, {
                        "aria-label": `Выбрать все разрешения раздела «${label}»`,
                        checked: allChecked,
                        indeterminate: someChecked,
                        onChange: (event) =>
                          page.togglePermissionGroup(
                            permissionIds,
                            event.target.checked,
                          ),
                      }),
                      h("h3", { className: styles.groupTitle }, label),
                      h(
                        "span",
                        {
                          className: styles.groupCount,
                          "data-active": groupSelected > 0 ? "true" : undefined,
                        },
                        `${groupSelected} / ${permissions.length}`,
                      ),
                    ),
                    h(
                      "ul",
                      { className: styles.perms },
                      permissions.map((permission) => {
                        const checked = page.selected.includes(
                          permission.permission_id,
                        );
                        return h(
                          "li",
                          {
                            key: permission.permission_id,
                            className: styles.permItem,
                          },
                          h(
                            "label",
                            { className: styles.perm },
                            h(
                              "span",
                              { className: styles.permLabel },
                              h(
                                "span",
                                { className: styles.permName },
                                permission.permission_name,
                              ),
                              h(
                                "span",
                                { className: styles.permCode },
                                permission.permission_code,
                              ),
                            ),
                            h(Checkbox, {
                              "aria-label": permission.permission_name,
                              checked,
                              onChange: (event) =>
                                page.togglePermission(
                                  permission.permission_id,
                                  event.target.checked,
                                ),
                            }),
                          ),
                        );
                      }),
                    ),
                  );
                }),
              ),
            ),
          )
        : h(
            "div",
            { className: styles.empty },
            h("h2", { className: styles.emptyTitle }, "Ролей пока нет"),
            h(
              "p",
              { className: styles.emptyText },
              "Создайте первую роль, чтобы настроить для неё разрешения.",
            ),
            h(
              Button,
              {
                appearance: "primary",
                icon: h(PlusIcon),
                onClick: page.openCreate,
              },
              "Новая роль",
            ),
          ),
    ),
  );
}
