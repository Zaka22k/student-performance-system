"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, FrostedGlass, TextField } from "@ui-kit/components";
import { login } from "@/actions/auth";
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
      <div className={`${styles.orb} ${styles.orbOne}`} aria-hidden="true" />
      <div className={`${styles.orb} ${styles.orbTwo}`} aria-hidden="true" />

      <FrostedGlass
        width="min(100%, 440px)"
        height="auto"
        radius={24}
        className={styles.card}
      >
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">АС</div>
          <div>
            <p className={styles.brandName}>АСУ «Успеваемость»</p>
            <p className={styles.brandCaption}>Система учёта учебных результатов</p>
          </div>
        </div>

        <div className={styles.heading}>
          <h1 className={styles.title}>Вход в систему</h1>
          <p className={styles.subtitle}>
            Введите логин и пароль, назначенные администратором.
          </p>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <TextField
            label="Логин"
            placeholder="Введите логин"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={80}
            required
            disabled={pending}
          />
          <TextField
            label="Пароль"
            type="password"
            placeholder="Введите пароль"
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
            height={42}
            disabled={pending}
          >
            {pending ? "Проверяем данные…" : "Войти"}
          </Button>
        </form>

        <div className={styles.footer}>
          <span className={styles.footerDot} aria-hidden="true" />
          Авторизация защищена серверной сессией
        </div>
      </FrostedGlass>
    </main>
  );
}
