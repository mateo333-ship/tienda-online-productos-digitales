import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/current-user";
import { listOrdersForUser, createOrderForUser } from "@/server/auth/orders-repo";
import { safeRoute } from "@/server/http/safe-route";

// Todas las rutas de este fichero comprueban la sesión en el servidor y
// solo devuelven/crean pedidos del usuario que ha iniciado sesión: nunca
// se confía en un "userId" que venga del propio navegador.

export const GET = safeRoute(async () => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const orders = await listOrdersForUser(user.id);
  return NextResponse.json({ orders });
});

const itemSchema = z.object({
  slug: z.string(),
  name: z.string(),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive().max(50),
});

const schema = z.object({
  items: z.array(itemSchema).min(1),
});

export const POST = safeRoute(async (req) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Carrito inválido" }, { status: 400 });
  }

  const total = parsed.data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order = await createOrderForUser(user.id, { items: parsed.data.items, total });

  return NextResponse.json({ ok: true, order });
});
