"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextField } from "@ui-kit/components";
import { login } from "@/actions/auth";
import LoginSheet from "./LoginSheet";
import styles from "./Login.module.css";

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
        setError(result.message ?? "Не удалось выполнить вход.");
        return;
      }
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const destination =
        requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
          ? requestedPath
          : "/";
      router.replace(destination);
      router.refresh();
    } catch {
      setError("Не удалось подключиться к системе. Попробуйте ещё раз.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.screen}>
      <div className={styles.sheet}>
        <div className={styles.lattice} aria-hidden="true">
          <LoginSheet />
        </div>
        <div className={styles.brand}>
          <p className={styles.wordmark}>АСУ «Успеваемость»</p>
          <p className={styles.tagline}>
            Журнал оценок, сессия, аналитика и отчёты.
          </p>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelInner}>
          <h1 className={styles.title}>Вход в систему</h1>

          <form className={styles.form} onSubmit={submit}>
            <TextField
              label="Логин"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={80}
              required
              disabled={pending}
            />
            <TextField
              label="Пароль"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              maxLength={128}
              required
              disabled={pending}
            />
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <Button
              appearance="primary"
              type="submit"
              width="100%"
              height={40}
              disabled={pending}
            >
              {pending ? "Входим…" : "Войти"}
            </Button>
          </form>

          <p className={styles.note}>
            Логин и пароль выдаёт администратор. Если забыли пароль, обратитесь
            к нему.
          </p>
        </div>
      </div>
    </main>
  );
}
