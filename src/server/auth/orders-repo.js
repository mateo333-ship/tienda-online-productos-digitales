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
