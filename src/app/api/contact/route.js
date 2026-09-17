import { NextResponse } from "next/server";
import { z } from "zod";
import { readJsonStore, writeJsonStore } from "@/server/data/store";
import { checkRateLimit } from "@/server/auth/rate-limit";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  message: z.string().trim().min(1).max(2000),
});

function clientKey(req) {
  return req.headers.get("x-forwarded-for") ?? "local";
}

export async function POST(req) {
  const limit = checkRateLimit(`contact:${clientKey(req)}`, { max: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Demasiados mensajes. Inténtalo más tarde." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los campos del formulario." }, { status: 400 });
  }

  const messages = await readJsonStore("contact-messages.json", []);
  messages.push({ ...parsed.data, createdAt: Date.now() });
  await writeJsonStore("contact-messages.json", messages);

  // TODO: cuando conectéis un proveedor de email, notificar aquí también
  // a la dirección de la tienda además de guardarlo.
  console.log(`[CONTACTO] Nuevo mensaje de ${parsed.data.email}`);

  return NextResponse.json({ ok: true });
}
