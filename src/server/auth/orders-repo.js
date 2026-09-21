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

export async function createOrderForUser(userId, { items, total }) {
  const orders = await readJsonStore(ORDERS_FILE, []);
  const order = {
    id: randomUUID(),
    userId,
    items,
    total,
    status: "pendiente",
    createdAt: Date.now(),
  };
  orders.push(order);
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
