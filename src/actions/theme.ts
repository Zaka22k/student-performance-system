"use server";

import { cookies } from "next/headers";

export async function setThemeCookie(theme: string) {
  const cookieStore = await cookies();
  cookieStore.set("app-theme", theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function setAccentCookie(accent: string) {
  const cookieStore = await cookies();
  cookieStore.set("app-accent", accent, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
