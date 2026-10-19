import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/register") {
    return NextResponse.next();
  }

  const role = request.nextUrl.searchParams.get("role");
  if (role === "customer" || role === "rider" || role === "driver") {
    const loginRole = role === "customer" ? "customer" : "rider";
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("role", loginRole);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/register",
};
