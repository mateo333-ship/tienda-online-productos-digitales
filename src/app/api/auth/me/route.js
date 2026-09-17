import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSessionToken, SESSION_COOKIE_NAME } from "@/server/auth/session";
import { findUserById, publicUser } from "@/server/auth/users-repo";
import { safeRoute } from "@/server/http/safe-route";

// Nunca cachear esta ruta: dice quién ha iniciado sesión ahora mismo, así
// que una respuesta guardada en caché (por el navegador o por una CDN)
// podría mostrarle a alguien la sesión de otra persona, o al revés,
// seguir mostrando "sin sesión" justo después de iniciar sesión.
export const dynamic = "force-dynamic";

export const GET = safeRoute(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const userId = await readSessionToken(token);
  if (!userId) {
    return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const user = await findUserById(userId);
  return NextResponse.json(
    { user: publicUser(user) },
    { headers: { "Cache-Control": "no-store" } }
  );
});
