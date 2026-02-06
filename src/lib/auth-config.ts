import type { CookieSerializeOptions } from "cookie";

export const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: process.env.AUTH_COOKIE_NAME ?? "MusicExplorerAuth",
  cookieSignatureKeys: (
    process.env.AUTH_COOKIE_SIGNATURE_KEYS ?? ""
  ).split(","),
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 12 * 60 * 60 * 24, // 12 days
  } satisfies CookieSerializeOptions,
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  },
  loginPath: "/api/login",
  logoutPath: "/api/logout",
};
