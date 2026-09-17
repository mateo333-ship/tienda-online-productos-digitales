import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/auth/session";
import { safeRoute } from "@/server/http/safe-route";

export const POST = safeRoute(async () => {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
});
