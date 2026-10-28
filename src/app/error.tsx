"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@ui-kit/components";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    console.error("Ошибка загрузки страницы:", error);
  }, [error]);

  const handleRetry = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <div
      role="alert"
      style={{
        flex: 1,
        flexDirection: "column",
        gap: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        padding: 24,
      }}
    >
      <p className="SubtitleTextBlockStyle">Не удалось загрузить страницу</p>
      <p
        className="BodyTextBlockStyle"
        style={{ color: "var(--label-secondary)", maxWidth: 420 }}
      >
        Проверьте подключение к базе данных и попробуйте снова.
      </p>
      <Button disabled={isPending} onClick={handleRetry}>
        Повторить
      </Button>
    </div>
  );
}
