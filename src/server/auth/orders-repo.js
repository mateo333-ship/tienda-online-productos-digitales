import "server-only";

import { randomUUID } from "node:crypto";
import { readJsonStore, writeJsonStore } from "../data/store.js";

// Mismo patrón que users-repo.js: hoy es un JSON, mañana puede ser SQL,
// y el resto de la app no se entera del cambio.
const ORDERS_FILE = "orders.json";

export async function listOrdersForUser(userId) {
  const orders = await readJsonStore(ORDERS_FILE, []);
  return orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function createOrderForUser(userId, { items, total, status = "pendiente", buyerInfo = null }) {
  const orders = await readJsonStore(ORDERS_FILE, []);
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
  orders.push(order);
  await writeJsonStore(ORDERS_FILE, orders);
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
  const orders = await readJsonStore(ORDERS_FILE, []);
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.status = status;
  Object.assign(order, extra);
  await writeJsonStore(ORDERS_FILE, orders);
  return order;
}

/**
 * Elimina un pedido, pero SOLO si pertenece al usuario que lo pide: se
 * comprueba `o.userId === userId` antes de borrar, así que nadie puede
 * borrar (ni siquiera adivinando el id) un pedido de otra cuenta.
 * Devuelve `true` si había un pedido suyo con ese id y se ha borrado.
 */
export async function deleteOrderForUser(userId, orderId) {
  const orders = await readJsonStore(ORDERS_FILE, []);
  const existed = orders.some((o) => o.id === orderId && o.userId === userId);
  if (!existed) return false;

  const remaining = orders.filter((o) => !(o.id === orderId && o.userId === userId));
  await writeJsonStore(ORDERS_FILE, remaining);
  return true;
}
