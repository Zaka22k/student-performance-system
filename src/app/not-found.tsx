"use client";

import { useRouter } from "next/navigation";
import { Page, Button } from "@ui-kit/components";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <Page title="Страница не найдена">
      <div className={styles.root}>
        <div className={styles.code} aria-hidden="true">
          404
        </div>
        <p className={`BodyTextBlockStyle ${styles.text}`}>
          Такой страницы нет. Возможно, адрес набран с ошибкой или страница была
          удалена.
        </p>
        <div className={styles.actions}>
          <Button onClick={() => router.push("/")}>На главную</Button>
        </div>
      </div>
    </Page>
  );
}
