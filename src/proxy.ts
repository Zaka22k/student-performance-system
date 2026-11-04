import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "app-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-app-pathname", pathname);

  if (pathname === "/login") {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // API-маршруты сами возвращают 401/403 в JSON. Для страниц
  // отсутствие cookie можно сразу перенаправить на форму входа.
  if (!request.cookies.has(COOKIE_NAME) && !pathname.startsWith("/api/")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Наличие cookie не считается подтверждением авторизации:
  // RootLayout и серверные действия проверяют сессию по hash в PostgreSQL.
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|favicon-dark.svg|favicon-light.svg|robots.txt|report.xsl).*)"],
};
