import "server-only";

import { readJsonStore, writeJsonStore } from "../data/store.js";

/**
 * ------------------------------------------------------------------
 *  El carrito pertenece a la cuenta, no al navegador
 * ------------------------------------------------------------------
 * Guardamos un carrito por usuario (indexado por su id) en vez de en
 * localStorage. Así:
 *   - sin haber iniciado sesión no existe ningún carrito que rellenar
 *     (las rutas de la API lo comprueban y devuelven 401),
 *   - si cierras sesión, ya no hay ningún carrito que mostrar (vuelve a 0),
 *   - si vuelves a iniciar sesión más tarde, tu carrito sigue ahí tal
 *     como lo dejaste, sin haber pagado,
 *   - cada cliente ve siempre el suyo, nunca el de otra cuenta.
 * ------------------------------------------------------------------
 */

const CARTS_FILE = "carts.json";

export async function getCartForUser(userId) {
  const carts = await readJsonStore(CARTS_FILE, {});
  return carts[userId] ?? [];
}

export async function saveCartForUser(userId, items) {
  const carts = await readJsonStore(CARTS_FILE, {});
  carts[userId] = items;
  await writeJsonStore(CARTS_FILE, carts);
}

export async function clearCartForUser(userId) {
  await saveCartForUser(userId, []);
}
