import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Siempre permitir: login y callback de auth
  if (
    pathname === "/dashboard/login" ||
    pathname.startsWith("/dashboard/auth")
  ) {
    return NextResponse.next();
  }

  // Rutas /dashboard/* — requieren cookie de sesión de Supabase
  if (pathname.startsWith("/dashboard")) {
    const hasSession = request.cookies
      .getAll()
      .some(
        (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
      );

    if (!hasSession) {
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
