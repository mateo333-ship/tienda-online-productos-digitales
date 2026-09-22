import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/current-user";
import { deleteOrderForUser } from "@/server/auth/orders-repo";
import { safeRoute } from "@/server/http/safe-route";

// Borra un pedido concreto. Igual que el resto de rutas de cuenta: la
// sesión se comprueba en el servidor y `deleteOrderForUser` solo borra si
// el pedido es de ese usuario — nunca se confía en un id que venga del
// navegador para decidir de quién es el pedido — y nunca si ya está
// pagado, para que el historial de compras reales no se pueda perder.
export const DELETE = safeRoute(async (_req, { params }) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const result = await deleteOrderForUser(user.id, id);

  if (result === "paid") {
    return NextResponse.json(
      { error: "Un pedido ya pagado no se puede eliminar: se queda como historial de tu compra." },
      { status: 403 }
    );
  }
  if (result === "not_found") {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
});
