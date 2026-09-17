import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSessionToken, SESSION_COOKIE_NAME } from "@/server/auth/session";
import { findUserById, publicUser } from "@/server/auth/users-repo";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const userId = await readSessionToken(token);
  if (!userId) return NextResponse.json({ user: null });

  const user = await findUserById(userId);
  return NextResponse.json({ user: publicUser(user) });
}
