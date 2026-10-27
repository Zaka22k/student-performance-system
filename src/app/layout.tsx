import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ModalProvider, ToastProvider } from "@/components";
import AppLayout from "./AppLayout";

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <noscript>Для работы приложения нужно включить JavaScript.</noscript>
        <ToastProvider position="top-center" duration={5000}>
          <ModalProvider>
            <AppLayout>{children}</AppLayout>
          </ModalProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
