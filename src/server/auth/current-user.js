import "server-only";

import { cookies } from "next/headers";
import { readSessionToken, SESSION_COOKIE_NAME } from "./session";
import { findUserById, publicUser } from "./users-repo";

/** Para usar desde páginas/Server Components: obtiene el usuario logueado o null. */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const userId = await readSessionToken(token);
  if (!userId) return null;
  const user = await findUserById(userId);
  return publicUser(user);
}
