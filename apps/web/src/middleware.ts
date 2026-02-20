import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // Auth state is managed client-side (access token in memory, refresh token
  // as httpOnly cookie scoped to the API). Protected route guarding is handled
  // by the dashboard layout component which checks useAuth().
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
