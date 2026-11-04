"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useModal, useToast } from "@ui-kit/components";
import {
  createRole,
  deleteRole,
  replaceRolePermissions,
} from "@/actions/access-control";
import { getErrorMessage } from "@/utils";
import { RoleCreateForm, type AdminRoleOption } from "../UserForms";

export type AdminRole = AdminRoleOption & {
  description: string | null;
  permission_ids: string[];
};

export type AdminPermission = {
  permission_id: string;
  permission_code: string;
  permission_name: string;
};

export type RolePermissionGroup = [string, AdminPermission[]];

interface UseRolesPageOptions {
  initialData: {
    roles: AdminRole[];
    permissions: AdminPermission[];
  };
}

export function useRolesPage({ initialData }: UseRolesPageOptions) {
  const router = useRouter();
  const { openModal } = useModal();
  const toast = useToast();

  const [roles, setRoles] = useState(initialData.roles);
  const [activeRoleId, setActiveRoleId] = useState(
    initialData.roles[0]?.role_id ?? "",
  );
  const activeRole = roles.find((role) => role.role_id === activeRoleId);
  const [selected, setSelected] = useState<string[]>(
    activeRole?.permission_ids ?? [],
  );

  const grouped = useMemo<RolePermissionGroup[]>(() => {
    const map = new Map<string, AdminPermission[]>();
    for (const permission of initialData.permissions) {
      const category = permission.permission_code.split(".")[0] ?? "other";
      const group = map.get(category) ?? [];
      group.push(permission);
      map.set(category, group);
    }
    return [...map.entries()];
  }, [initialData.permissions]);

  const originalIds = [...(activeRole?.permission_ids ?? [])].sort();
  const selectedIds = [...selected].sort();
  const isDirty =
    originalIds.length !== selectedIds.length ||
    originalIds.some((id, index) => id !== selectedIds[index]);

  const selectedCount = selected.length;
  const builtInRole = activeRole
    ? ["admin", "teacher", "student"].includes(activeRole.role_code)
    : true;

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
            const role: AdminRole = {
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

    const role = activeRole;
    const permissionIds = [...selected];

    openModal({
      title: "Сохранить разрешения",
      actionText: "Сохранить",
      closeOnBackdropClick: false,
      errorMessage: getErrorMessage,
      content: (
        <div className="BodyTextBlockStyle">
          <p>
            Будет обновлён набор разрешений роли{" "}
            <strong className="BodyStrongTextBlockStyle">
              {role.role_name}
            </strong>.
          </p>
          <p>
            Все действующие сессии пользователей этой роли будут удалены.
            После этого им потребуется войти снова.
          </p>
        </div>
      ),
      onAction: async () => {
        await replaceRolePermissions(role.role_id, permissionIds);
        setRoles((current) =>
          current.map((item) =>
            item.role_id === role.role_id
              ? { ...item, permission_ids: permissionIds }
              : item,
          ),
        );
        toast.success("Разрешения сохранены", {
          description: `Сессии пользователей роли «${role.role_name}» отозваны.`,
        });
        router.refresh();
      },
    });
  };

  const confirmDelete = () => {
    if (!activeRole) return;

    const role = activeRole;
    openModal({
      title: "Удалить роль",
      actionText: "Удалить",
      actionAppearance: "destructive",
      errorMessage: getErrorMessage,
      content: (
        <div className="BodyTextBlockStyle">
          <p>
            Удалить роль{" "}
            <strong className="BodyStrongTextBlockStyle">
              {role.role_name}
            </strong>?
          </p>
          <p>
            Базовые роли нельзя удалять. Роль не должна быть назначена ни одному
            пользователю.
          </p>
        </div>
      ),
      onAction: async () => {
        await deleteRole(role.role_id);
        const remaining = roles.filter(
          (item) => item.role_id !== role.role_id,
        );
        setRoles(remaining);
        setActiveRoleId(remaining[0]?.role_id ?? "");
        setSelected(remaining[0]?.permission_ids ?? []);
        toast.success("Роль удалена");
        router.refresh();
      },
    });
  };

  const changeActiveRole = (roleId: string) => {
    const nextRole = roles.find((role) => role.role_id === roleId);
    setActiveRoleId(roleId);
    setSelected(nextRole?.permission_ids ?? []);
  };

  const togglePermission = (permissionId: string, checked: boolean) => {
    setSelected((current) =>
      checked
        ? [...new Set([...current, permissionId])]
        : current.filter((id) => id !== permissionId),
    );
  };

  const togglePermissionGroup = (
    permissionIds: string[],
    checked: boolean,
  ) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) permissionIds.forEach((id) => next.add(id));
      else permissionIds.forEach((id) => next.delete(id));
      return [...next];
    });
  };

  return {
    roles,
    permissions: initialData.permissions,
    activeRole,
    activeRoleId,
    selected,
    grouped,
    isDirty,
    selectedCount,
    builtInRole,
    changeActiveRole,
    togglePermission,
    togglePermissionGroup,
    openCreate,
    savePermissions,
    confirmDelete,
  };
}
