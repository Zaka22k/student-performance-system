"use client";

import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Page, Button } from "@ui-kit/components";

const rootStyle: CSSProperties = {
  flex: 1,
  flexDirection: "column",
  gap: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100%",
  padding: 24,
  textAlign: "center",
};

const codeStyle: CSSProperties = {
  fontSize: 96,
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: "-0.03em",
  fontVariantNumeric: "tabular-nums",
  color: "var(--system-red)",
  background:
    "linear-gradient(180deg, var(--system-red) 0%, rgba(var(--system-red-rgb), 0.55) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  userSelect: "none",
};

const textStyle: CSSProperties = {
  maxWidth: 420,
  margin: 0,
  color: "var(--label-secondary)",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 8,
};

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div style={rootStyle}>
      <div style={codeStyle} aria-hidden="true">
        404
      </div>
      <p className="BodyTextBlockStyle" style={textStyle}>
        Такой страницы нет. Возможно, адрес набран с ошибкой или страница была
        удалена.
      </p>
      <div style={actionsStyle}>
        <Button onClick={() => router.push("/")}>На главную</Button>
      </div>
    </div>
  );
}
