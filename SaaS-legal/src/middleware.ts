import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public routes that don't require auth
  const publicRoutes = ["/login", "/signup", "/verificar-email", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Static assets and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from login page
  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/legal-shield", req.nextUrl));
  }

  // [EVALUACIÓN TEMPORAL] Acceso público sin login deshabilitado
  // Para rehabilitar: descomentar el bloque de abajo
  // if (!isLoggedIn && !isPublicRoute) {
  //   return NextResponse.redirect(new URL("/login", req.nextUrl));
  // }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
