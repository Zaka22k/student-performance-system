"use server";

import { cookies } from "next/headers";
import { requirePermission } from "@/server/auth/session";

export async function setThemeCookie(theme: string) {\n  await requirePermission("settings.use");
  const cookieStore = await cookies();
  cookieStore.set("app-theme", theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function setAccentCookie(accent: string) {\n  await requirePermission("settings.use");
  const cookieStore = await cookies();
  cookieStore.set("app-accent", accent, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
