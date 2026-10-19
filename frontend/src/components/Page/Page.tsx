import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button";
import { ChevronLeftIcon } from "../icons";
import { ProgressRing } from "../ProgressRing";
import { Toolbar } from "../Toolbar";
import type { ToolbarProps } from "../Toolbar";
import styles from "./Page.module.css";

export interface PageProps {
  title: ReactNode;
  children?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  toolbar?: Pick<ToolbarProps, "leading" | "center" | "trailing">;
  onNavigate?: () => void | Promise<void>;
}

type NavigateStatus = "loading" | "ready" | "error";

const Page = ({
  title,
  children,
  showBackButton = false,
  onBack,
  toolbar,
  onNavigate,
}: PageProps) => {
  const navigate = useNavigate();

  const [status, setStatus] = useState<NavigateStatus>(
    onNavigate ? "loading" : "ready",
  );

  const onNavigateRef = useRef(onNavigate);
  useEffect(() => {
    onNavigateRef.current = onNavigate;
  });

  const runIdRef = useRef(0);

  const runNavigate = useCallback(async () => {
    const handler = onNavigateRef.current;
    if (!handler) {
      setStatus("ready");
      return;
    }

    const runId = ++runIdRef.current;
    setStatus("loading");

    try {
      await handler();
      if (runId === runIdRef.current) setStatus("ready");
    } catch (error) {
      console.error("Ошибка при загрузке страницы:", error);
      if (runId === runIdRef.current) setStatus("error");
    }
  }, []);

  useEffect(() => {
    void runNavigate();
    return () => {
      runIdRef.current += 1;
    };
  }, [runNavigate]);

  const leading = (showBackButton || toolbar?.leading) && (
    <>
      {showBackButton && (
        <Button
          onClick={onBack}
          aria-label="Назад"
          icon={<ChevronLeftIcon />}
          onClickCapture={() => navigate("..", { relative: "route" })}
        />
      )}
      {toolbar?.leading}
    </>
  );

  let body: ReactNode;
  if (status === "loading") {
    body = (
      <div className={styles.pageStatus}>
        <ProgressRing loading size={32} aria-label="Загрузка" />
      </div>
    );
  } else if (status === "error") {
    body = (
      <div className={styles.pageStatus} role="alert">
        <div className={`${styles.pageStatusText} BodyTextBlockStyle`}>
          Не удалось загрузить страницу.
        </div>
        <Button onClick={() => void runNavigate()}>Повторить</Button>
      </div>
    );
  } else {
    body = children;
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Toolbar
          leading={leading || undefined}
          title={<div className={`SubtitleTextBlockStyle`}>{title}</div>}
          center={toolbar?.center}
          trailing={toolbar?.trailing}
        />
      </div>
      <div className={styles.pageBody}>{body}</div>
    </div>
  );
};

export default Page;
