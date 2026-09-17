import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCartForUser, saveCartForUser } from "@/server/auth/cart-repo";
import { safeRoute } from "@/server/http/safe-route";

// El carrito de cada cliente cambia constantemente: nunca cachearlo.
export const dynamic = "force-dynamic";

// Todas las rutas de este fichero comprueban la sesión en el servidor y
// solo devuelven/guardan el carrito del usuario que ha iniciado sesión —
// sin sesión, no hay carrito posible (401), igual que con los pedidos.

export const GET = safeRoute(async () => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const items = await getCartForUser(user.id);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
});

const itemSchema = z.object({
  slug: z.string(),
  name: z.string(),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive().max(50),
});

const schema = z.object({
  items: z.array(itemSchema).max(200),
});

export const PUT = safeRoute(async (req) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Carrito inválido" }, { status: 400 });
  }

  await saveCartForUser(user.id, parsed.data.items);
  return NextResponse.json({ ok: true, items: parsed.data.items });
});
