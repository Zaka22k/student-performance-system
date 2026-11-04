import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "app-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/login") return NextResponse.next();

  // Пустые запросы отправляются на страницу входа. Содержимое cookie
  // не считается доказательством авторизации: все права проверяются сервером.
  if (!request.cookies.has(COOKIE_NAME)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
