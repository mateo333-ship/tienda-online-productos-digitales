import "server-only";

import Stripe from "stripe";
import { setOrderStatus } from "../auth/orders-repo";
import { clearCartForUser } from "../auth/cart-repo";

/**
 * ------------------------------------------------------------------
 *  Un único pago por todo el carrito, con Stripe Checkout
 * ------------------------------------------------------------------
 * Usamos "Stripe Checkout" (la página de pago alojada por el propio
 * Stripe) en vez de montar un formulario de tarjeta nosotros mismos:
 *   - Un solo "Checkout Session" puede llevar varios `line_items` (uno
 *     por producto del carrito) y el cliente paga TODO de una vez, con
 *     una sola tarjeta y una sola confirmación — justo lo que pediste.
 *   - Stripe se encarga de la pantalla de pago, así que los datos de la
 *     tarjeta nunca pasan por nuestro servidor (ni falta homologación
 *     PCI de nuestra parte).
 *
 * Como con Firebase y Brevo: si no hay STRIPE_SECRET_KEY configurada,
 * el resto de la web sigue funcionando en "modo demo" (el pedido se
 * guarda directamente, sin cobro real), para que nada se rompa mientras
 * configuras Stripe.
 * ------------------------------------------------------------------
 */

let cachedClient = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Falta STRIPE_SECRET_KEY en las variables de entorno.");
  }
  if (!cachedClient) {
    cachedClient = new Stripe(secretKey);
  }
  return cachedClient;
}

/**
 * Se llama justo cuando el cliente vuelve de pagar en Stripe (desde
 * `success_url`). Comprueba de verdad contra la API de Stripe que ESE
 * usuario ha pagado ESE pedido (nunca nos fiamos del simple hecho de que
 * el navegador haya vuelto a `/cuenta` con un `session_id` en la URL:
 * cualquiera podría escribir esa URL a mano con un id inventado).
 *
 * Esto da una confirmación instantánea en pantalla; el webhook de más
 * abajo (`/api/webhooks/stripe`) hace lo mismo de forma fiable aunque el
 * cliente cierre la pestaña antes de volver, así que es el que manda si
 * alguna vez los dos no coincidieran.
 */
export async function confirmCheckoutSession(sessionId, userId) {
  if (!isStripeConfigured() || !sessionId) return;
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") return;
    if (session.metadata?.userId !== userId) return; // sesión de otra cuenta: se ignora

    const orderId = session.metadata?.orderId;
    if (!orderId) return;

    await setOrderStatus(orderId, "pagado");
    await clearCartForUser(userId);
  } catch (err) {
    console.error("[STRIPE] No se ha podido confirmar la sesión de pago:", err.message);
  }
}
