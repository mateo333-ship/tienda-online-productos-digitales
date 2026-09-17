import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtpCode } from "@/server/auth/crypto";
import {
  findPendingByEmail,
  registerOtpAttempt,
  isOtpExpired,
  hasTooManyOtpAttempts,
  activatePendingRegistration,
} from "@/server/auth/users-repo";
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from "@/server/auth/session";
import { checkRateLimit } from "@/server/auth/rate-limit";
import { publicUser } from "@/server/auth/users-repo";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().length(6),
});

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }
  const { email, code } = parsed.data;

  const limit = checkRateLimit(`verify:${email}`, { max: 8, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Solicita un código nuevo más tarde." },
      { status: 429 }
    );
  }

  const record = await findPendingByEmail(email);
  if (!record) {
    return NextResponse.json(
      { error: "No hay ningún registro pendiente para este email." },
      { status: 400 }
    );
  }

  if (isOtpExpired(record)) {
    return NextResponse.json(
      { error: "El código ha caducado. Vuelve a registrarte para recibir uno nuevo." },
      { status: 400 }
    );
  }

  if (hasTooManyOtpAttempts(record)) {
    return NextResponse.json(
      { error: "Demasiados intentos fallidos. Vuelve a registrarte para recibir un código nuevo." },
      { status: 400 }
    );
  }

  const isValid = verifyOtpCode(code, record.otpHash);
  if (!isValid) {
    await registerOtpAttempt(email);
    return NextResponse.json({ error: "El código no es correcto." }, { status: 400 });
  }

  const user = await activatePendingRegistration(email);
  const token = await createSessionToken(user.id);

  const res = NextResponse.json({ ok: true, user: publicUser(user) });
  res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  return res;
}
