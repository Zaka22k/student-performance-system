"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = await login(username, password);
      if (!result.ok) {
        setError(result.message ?? "Не удалось войти");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError("Не удалось выполнить вход. Проверьте подключение к серверу.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 380, display: "grid", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>АСУ «Успеваемость»</h1>
          <p>Войдите в систему с помощью учётной записи.</p>
        </div>
        <label style={{ display: "grid", gap: 6 }}>
          Логин
          <input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required maxLength={80} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          Пароль
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p role="alert" style={{ color: "var(--color-danger, #b42318)" }}>{error}</p>}
        <button type="submit" disabled={pending}>{pending ? "Вход..." : "Войти"}</button>
      </form>
    </main>
  );
}
