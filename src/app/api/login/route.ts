import { NextRequest } from "next/server";
import { setAuthCookies } from "next-firebase-auth-edge/lib/next/cookies";
import { authConfig } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  const headers = new Headers(request.headers);
  const response = await setAuthCookies(headers, authConfig);
  return response;
}

export async function POST(request: NextRequest) {
  const headers = new Headers(request.headers);
  const response = await setAuthCookies(headers, authConfig);
  return response;
}
