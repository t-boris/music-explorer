import { NextRequest, NextResponse } from "next/server";
import {
  authMiddleware,
  redirectToLogin,
  redirectToHome,
} from "next-firebase-auth-edge";
import { authConfig } from "@/lib/auth-config";

const publicPaths = [
  "/",
  "/login",
  "/levels",
  /^\/levels\/.*/,
  "/songs",
  /^\/songs\/.*/,
  "/glossary",
];

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    ...authConfig,
    handleInvalidToken: async () => {
      return redirectToLogin(request, {
        path: "/login",
        publicPaths,
      });
    },
    handleValidToken: async (_tokens, headers) => {
      // If user is already authenticated and visits /login, redirect to dashboard
      if (request.nextUrl.pathname === "/login") {
        return redirectToHome(request, { path: "/dashboard" });
      }

      // Otherwise, continue with the request
      return NextResponse.next({
        request: {
          headers,
        },
      });
    },
    handleError: async () => {
      return redirectToLogin(request, {
        path: "/login",
        publicPaths,
      });
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/login|api/logout|.*\\.).*)",
  ],
};
