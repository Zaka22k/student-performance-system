import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import "./globals.css";
import {
  ModalProvider,
  ToastProvider,
  ThemeProvider,
  type Theme,
  type AccentColor,
} from "@ui-kit/components";
import AppLayout from "./AppLayout";
import { getCurrentSession } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "АСУ «Успеваемость»",
  description:
    "Информационная система учёта успеваемости студентов: журнал, сессия, аналитика и отчёты.",
  applicationName: "АСУ «Успеваемость»",
  robots: {
    index: false,
    follow: false,
  },
  referrer: "same-origin",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/favicon-light.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("app-theme")?.value as Theme) || "light";
  const accent =
    (cookieStore.get("app-accent")?.value as AccentColor) || "green";
  const session = await getCurrentSession();
  const currentUser = session
    ? { permissions: [...session.permissions] }
    : null;
  const pathname = (await headers()).get("x-app-pathname");
  if (!session && pathname !== "/login") redirect("/login");
  if (session && pathname === "/login") redirect("/");

  return (
    <html lang="ru" data-theme={theme} data-accent={accent}>
      <body>
        <noscript>Для работы приложения нужно включить JavaScript.</noscript>
        <ThemeProvider initialTheme={theme} initialAccent={accent}>
          <ToastProvider position="top-center" duration={5000}>
            <ModalProvider>
              <AppLayout currentUser={currentUser}>{children}</AppLayout>
            </ModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
