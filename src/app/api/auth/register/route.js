import { NextResponse } from "next/server";
import { z } from "zod";
import { hashOtpCode, generateOtpCode, hashPassword } from "@/server/auth/crypto";
import { createPendingRegistration, findUserByEmail } from "@/server/auth/users-repo";
import { sendVerificationEmail } from "@/server/auth/mailer";
import { checkRateLimit } from "@/server/auth/rate-limit";
import { safeRoute } from "@/server/http/safe-route";

const schema = z.object({
  name: z.string().trim().min(2, "El nombre es demasiado corto").max(80),
  email: z.string().trim().toLowerCase().email("Introduce un email válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(200),
});

function clientKey(req) {
  return req.headers.get("x-forwarded-for") ?? "local";
}

export const POST = safeRoute(async (req) => {
  const limit = checkRateLimit(`register:${clientKey(req)}`, { max: 6, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Inténtalo de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    // No decimos "este email ya existe ya que es tuyo o de otra persona"
    // para no filtrar qué emails están registrados a un posible atacante.
    return NextResponse.json(
      { error: "No se ha podido completar el registro con esos datos." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  const code = generateOtpCode();
  const otpHash = hashOtpCode(code);

  await createPendingRegistration({ email, name, passwordHash, otpHash });
  await sendVerificationEmail(email, code);

  const isDev = process.env.NODE_ENV !== "production";

  return NextResponse.json({
    ok: true,
    email,
    // Solo en desarrollo devolvemos el código en la respuesta, para poder
    // probar la web sin tener un proveedor de email conectado todavía.
    // En producción esto se elimina automáticamente.
    devCode: isDev ? code : undefined,
  });
});
