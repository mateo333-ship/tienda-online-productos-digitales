import "server-only";

import { randomUUID } from "node:crypto";
import { readJsonStore, updateJsonStore } from "../data/store.js";

// Mismo patrón que users-repo.js: hoy es un JSON, mañana puede ser SQL,
// y el resto de la app no se entera del cambio.
const ORDERS_FILE = "orders.json";

export async function listOrdersForUser(userId) {
  const orders = await readJsonStore(ORDERS_FILE, []);
  return orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Las tres funciones que cambian algo (crear, cambiar estado, borrar)
 * usan `updateJsonStore` en vez de "leo y luego guardo" por separado:
 * así, si dos peticiones llegan casi a la vez (dos compras a la vez, o
 * un borrado justo cuando llega la confirmación de otro pago), ninguna
 * de las dos pisa a la otra sin darse cuenta — ver la explicación larga
 * en src/server/data/store.js, junto a `updateFirebase`.
 */

export async function createOrderForUser(userId, { items, total, status = "pendiente", buyerInfo = null }) {
  const order = {
    id: randomUUID(),
    userId,
    items,
    total,
    status,
    // Datos de a quién y a qué email hay que entregarle la compra: se
    // piden en el propio carrito antes de pagar (ver /api/checkout) y
    // pueden no coincidir con el email de la cuenta, así que se guardan
    // aparte, por pedido.
    buyerInfo,
    createdAt: Date.now(),
  };

  await updateJsonStore(ORDERS_FILE, [], (orders) => ({
    next: [...orders, order],
  }));

  return order;
}

/** Busca un pedido por id, sin filtrar por usuario — solo para uso interno
 * desde el webhook de Stripe (que llega del propio Stripe, no del
 * navegador de un cliente). Ninguna ruta pública debe exponer esto tal
 * cual sin comprobar antes a quién pertenece el pedido. */
export async function findOrderById(orderId) {
  const orders = await readJsonStore(ORDERS_FILE, []);
  return orders.find((o) => o.id === orderId) ?? null;
}

/**
 * `extra` deja actualizar otros campos del pedido a la vez que el
 * estado — hoy se usa para guardar `buyerInfo` (nombre/email/teléfono)
 * en el momento en que Stripe los confirma, ya que ahora se piden en la
 * propia pantalla de pago en vez de en el carrito (ver deliverPaidOrder
 * en src/server/payments/stripe.js).
 */
export async function setOrderStatus(orderId, status, extra = {}) {
  const { updatedOrder } = await updateJsonStore(ORDERS_FILE, [], (orders) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { next: undefined, updatedOrder: null };
    Object.assign(order, { status }, extra);
    return { next: orders, updatedOrder: order };
  });
  return updatedOrder;
}

/**
 * Elimina un pedido, pero con dos comprobaciones, ambas en el servidor y
 * ninguna basada en lo que diga el navegador:
 *
 *  1. Solo si pertenece al usuario que lo pide (`o.userId === userId`),
 *     así que nadie puede borrar —ni siquiera adivinando el id— un pedido
 *     de otra cuenta.
 *  2. Solo si NO está ya pagado: un pedido "pagado" es el historial real
 *     de una compra (y la prueba de que se entregó el acceso), así que
 *     una vez pagado se queda para siempre en la cuenta, no se puede
 *     eliminar ni por error ni a propósito.
 *
 * Devuelve un motivo (`"ok"`, `"not_found"` o `"paid"`) en vez de solo
 * true/false, para que la API pueda explicar claramente por qué no se ha
 * borrado cuando corresponda.
 */
export async function deleteOrderForUser(userId, orderId) {
  const { outcome } = await updateJsonStore(ORDERS_FILE, [], (orders) => {
    const order = orders.find((o) => o.id === orderId && o.userId === userId);
    if (!order) return { next: undefined, outcome: "not_found" };
    if (order.status === "pagado") return { next: undefined, outcome: "paid" };

    const remaining = orders.filter((o) => !(o.id === orderId && o.userId === userId));
    return { next: remaining, outcome: "ok" };
  });
  return outcome;
}
