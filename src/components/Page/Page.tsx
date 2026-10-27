"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import Button from "../Button";
import { ProgressRing } from "../ProgressRing";
import { Toolbar } from "../Toolbar";
import type { ToolbarProps } from "../Toolbar";
import {
  PageFrameContext,
  usePageTransition,
} from "../NavigationView/pageTransitions";
import type { PageTransitionSetting } from "../NavigationView/pageTransitions";
import styles from "./Page.module.css";

export interface PageProps {
  title: ReactNode;
  children?: ReactNode;
  onBack?: () => void;
  toolbar?: Pick<ToolbarProps, "leading" | "center" | "trailing">;
  onNavigate?: () => void | Promise<void>;
  transition?: PageTransitionSetting;
}

type NavigateStatus = "loading" | "ready" | "error";

const ChevronLeftIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
};

const Page = ({
  title,
  children,
  onBack,
  toolbar,
  onNavigate,
  transition,
}: PageProps) => {
  const frame = useContext(PageFrameContext);
  usePageTransition(transition);

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

  const leading = (Boolean(onBack) || Boolean(toolbar?.leading)) && (
    <>
      {onBack && (
        <Button
          onClick={onBack}
          aria-label="Назад"
          icon={<ChevronLeftIcon />}
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

  const header = (
    <div className={styles.pageHeader}>
      <Toolbar
        leading={leading || undefined}
        title={<div className="SubtitleTextBlockStyle">{title}</div>}
        center={toolbar?.center}
        trailing={toolbar?.trailing}
      />
    </div>
  );

  return (
    <div className={styles.page}>
      {frame?.headerSlot ? createPortal(header, frame.headerSlot) : header}
      <div className={styles.pageBody}>{body}</div>
    </div>
  );
};

export default Page;
