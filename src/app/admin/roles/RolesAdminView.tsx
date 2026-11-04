"use client";

import { type FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createRole,
  deleteRole,
  replaceRolePermissions,
} from "@/actions/access-control";

type Role = {
  role_id: string;
  role_code: string;
  role_name: string;
  description: string | null;
  permission_ids: string[];
};
type Permission = {
  permission_id: string;
  permission_code: string;
  permission_name: string;
};

export default function RolesAdminView({
  initialData,
}: {
  initialData: { roles: Role[]; permissions: Permission[] };
}) {
  const router = useRouter();
  const [roles, setRoles] = useState(initialData.roles);
  const [activeRoleId, setActiveRoleId] = useState(initialData.roles[0]?.role_id ?? "");
  const activeRole = roles.find((role) => role.role_id === activeRoleId);
  const [selected, setSelected] = useState<string[]>(activeRole?.permission_ids ?? []);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    setSelected(activeRole?.permission_ids ?? []);
  }, [activeRoleId, activeRole?.permission_ids]);

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

  function togglePermission(id: string, checked: boolean) {
    setSelected((current) =>
      checked ? [...new Set([...current, id])] : current.filter((item) => item !== id),
    );
  }

  function savePermissions() {
    if (!activeRole) return;
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        await replaceRolePermissions(activeRole.role_id, selected);
        setRoles((current) =>
          current.map((role) =>
            role.role_id === activeRole.role_id
              ? { ...role, permission_ids: selected }
              : role,
          ),
        );
        setNotice(`Разрешения роли «${activeRole.role_name}» сохранены. Её активные сессии удалены.`);
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Не удалось сохранить разрешения");
      }
    });
  }

  function submitRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        const created = await createRole({
          role_code: newCode,
          role_name: newName,
          description: newDescription,
        });
        const newRole: Role = {
          role_id: created.role_id,
          role_code: newCode.trim().toLowerCase(),
          role_name: newName.trim(),
          description: newDescription.trim() || null,
          permission_ids: [],
        };
        setRoles((current) => [...current, newRole]);
        setActiveRoleId(created.role_id);
        setSelected([]);
        setNewCode("");
        setNewName("");
        setNewDescription("");
        setNotice("Роль создана. Назначьте ей разрешения.");
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Не удалось создать роль");
      }
    });
  }

  function removeRole() {
    if (!activeRole) return;
    setError("");
    startTransition(async () => {
      try {
        await deleteRole(activeRole.role_id);
        const remaining = roles.filter((role) => role.role_id !== activeRole.role_id);
        setRoles(remaining);
        setActiveRoleId(remaining[0]?.role_id ?? "");
        setSelected(remaining[0]?.permission_ids ?? []);
        setNotice("Роль удалена");
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Не удалось удалить роль");
      }
    });
  }

  return (
    <main style={{ display: "grid", gap: 24, padding: 24 }}>
      <header>
        <h1>Роли и разрешения</h1>
        <p>Разрешения сохраняются в роли. При изменении набора разрешений сессии пользователей этой роли отзываются триггером PostgreSQL.</p>
      </header>

      <section style={{ display: "grid", gap: 12, maxWidth: 560, border: "1px solid var(--border, #ddd)", borderRadius: 12, padding: 20 }}>
        <h2>Создать роль</h2>
        <form onSubmit={submitRole} style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 5 }}>Код роли<input value={newCode} onChange={(event) => setNewCode(event.target.value)} required maxLength={50} placeholder="например, curator" /></label>
          <label style={{ display: "grid", gap: 5 }}>Название<input value={newName} onChange={(event) => setNewName(event.target.value)} required maxLength={100} /></label>
          <label style={{ display: "grid", gap: 5 }}>Описание<textarea value={newDescription} onChange={(event) => setNewDescription(event.target.value)} rows={2} /></label>
          <button type="submit" disabled={pending}>Создать роль</button>
        </form>
      </section>

      <section style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>Настройка разрешений</h2>
          <select value={activeRoleId} onChange={(event) => setActiveRoleId(event.target.value)}>
            {roles.map((role) => <option key={role.role_id} value={role.role_id}>{role.role_name} ({role.role_code})</option>)}
          </select>
          {activeRole && !["admin", "teacher", "student"].includes(activeRole.role_code) && (
            <button type="button" disabled={pending} onClick={removeRole}>Удалить роль</button>
          )}
        </div>

        {activeRole && (
          <>
            <p>{activeRole.description ?? "Описание не задано"}</p>
            <div style={{ display: "grid", gap: 18 }}>
              {grouped.map(([category, permissions]) => (
                <section key={category} style={{ border: "1px solid var(--border, #ddd)", borderRadius: 12, padding: 16 }}>
                  <h3 style={{ marginTop: 0 }}>{category}</h3>
                  <div style={{ display: "grid", gap: 10 }}>
                    {permissions.map((permission) => (
                      <label key={permission.permission_id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                          type="checkbox"
                          checked={selected.includes(permission.permission_id)}
                          onChange={(event) => togglePermission(permission.permission_id, event.target.checked)}
                        />
                        <span>
                          <strong>{permission.permission_name}</strong>
                          <span style={{ display: "block", opacity: 0.65, fontSize: 12 }}>{permission.permission_code}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <button type="button" disabled={pending} onClick={savePermissions}>Сохранить разрешения</button>
          </>
        )}
      </section>

      {error && <p role="alert" style={{ color: "#b42318" }}>{error}</p>}
      {notice && <p role="status">{notice}</p>}
    </main>
  );
}
