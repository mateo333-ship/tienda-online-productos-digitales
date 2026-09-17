import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/server/auth/crypto";
import { findUserByEmail, publicUser } from "@/server/auth/users-repo";
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from "@/server/auth/session";
import { checkRateLimit } from "@/server/auth/rate-limit";
import { safeRoute } from "@/server/http/safe-route";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

function clientKey(req) {
  return req.headers.get("x-forwarded-for") ?? "local";
}

export const POST = safeRoute(async (req) => {
  const limit = checkRateLimit(`login:${clientKey(req)}`, { max: 10, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Inténtalo de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Introduce un email y una contraseña válidos." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await findUserByEmail(email);
  // Mismo mensaje de error tanto si el email no existe como si la
  // contraseña es incorrecta: no le decimos a un atacante cuál de las dos
  // cosas ha fallado.
  const genericError = () =>
    NextResponse.json({ error: "Email o contraseña incorrectos." }, { status: 401 });

  if (!user) return genericError();

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) return genericError();

  const token = await createSessionToken(user.id);
  const res = NextResponse.json({ ok: true, user: publicUser(user) });
  res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  return res;
});
