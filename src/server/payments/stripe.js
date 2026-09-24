import "server-only";

import Stripe from "stripe";
import { setOrderStatus, findOrderById } from "../auth/orders-repo";
import { clearCartForUser } from "../auth/cart-repo";
import { sendOrderDeliveryEmail } from "../auth/mailer";
import { getProductBySlug } from "../../lib/products";

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
 * El nombre, email y teléfono del comprador ya NO se piden en nuestro
 * propio carrito: se piden directamente en la pantalla de pago de
 * Stripe (email de contacto + teléfono, ambos nativos de Checkout, y
 * "Nombre completo" como campo personalizado — ver /api/checkout), así
 * el cliente rellena todo en un único sitio junto al código de
 * descuento. Esta función saca esos datos de la Checkout Session que
 * Stripe nos devuelve (por el webhook o al recuperar la sesión), tanto
 * si viene del webhook como de `confirmCheckoutSession`.
 */
export function extractBuyerInfoFromSession(session) {
  const email = session.customer_details?.email || null;
  if (!email) return null;

  const nameField = session.custom_fields?.find((f) => f.key === "nombre_completo");
  const name = nameField?.text?.value?.trim() || session.customer_details?.name || "Cliente";
  const phone = session.customer_details?.phone || null;
  // `customer` es el Cliente de Stripe que se crea automáticamente al
  // pagar (`customer_creation: "always"`, ver /api/checkout): lo usamos
  // para completarle el nombre y el teléfono, que Stripe no rellena solo
  // a partir de un campo personalizado como "Nombre completo".
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;

  return { name, email, phone, stripeCustomerId };
}

/**
 * Marca un pedido como pagado, guarda quién lo compró (con los datos que
 * Stripe acaba de recoger en su propia pantalla de pago), vacía el
 * carrito y entrega la compra por email — TODO en un único sitio para
 * que da igual por qué camino llegue la confirmación (webhook o vuelta
 * del cliente a /cuenta), el resultado es siempre el mismo.
 *
 * Es idempotente a propósito: si el pedido YA estaba "pagado" (porque el
 * otro camino se adelantó), no hace nada más — así nunca se manda el
 * email de entrega dos veces aunque el webhook y la vuelta del cliente
 * lleguen casi a la vez.
 *
 * `chargedTotal` (opcional) es el `amount_total` que Stripe devuelve en
 * la propia Checkout Session, en céntimos: lo que el cliente ha pagado
 * DE VERDAD, ya con cualquier código de descuento aplicado. `order.total`
 * se calculó antes de crear esa sesión, así que si alguien usa un código
 * válido (ver `allow_promotion_codes` en /api/checkout), sin esto el
 * pedido se quedaría marcado con el precio de ANTES del descuento para
 * siempre en "Mi cuenta" y en cualquier informe — no es un fallo de
 * seguridad (a quien paga menos con un código real de Stripe se le debe
 * cobrar menos), pero si no se actualiza aquí el importe guardado no
 * coincidiría con lo que Stripe cobró de verdad.
 */
export async function deliverPaidOrder(order, buyerInfo, chargedTotal) {
  if (!order || order.status === "pagado") return;

  const finalBuyerInfo = buyerInfo
    ? { name: buyerInfo.name, email: buyerInfo.email, phone: buyerInfo.phone }
    : order.buyerInfo;

  const extra = finalBuyerInfo ? { buyerInfo: finalBuyerInfo } : {};
  if (typeof chargedTotal === "number" && chargedTotal !== order.total) {
    extra.total = chargedTotal;
  }

  await setOrderStatus(order.id, "pagado", extra);
  await clearCartForUser(order.userId);

  // El nombre (y el teléfono, si lo dio) se completan también en el
  // Cliente de Stripe correspondiente, para que se vean en el panel de
  // Stripe (Clientes / ficha del pago) y no solo en esta web.
  if (buyerInfo?.stripeCustomerId && isStripeConfigured()) {
    try {
      const stripe = getStripeClient();
      await stripe.customers.update(buyerInfo.stripeCustomerId, {
        name: buyerInfo.name,
        phone: buyerInfo.phone || undefined,
      });
    } catch (err) {
      console.error("[STRIPE] No se ha podido actualizar el nombre/teléfono del cliente:", err.message);
    }
  }

  // Cada producto lleva su propio enlace de acceso (campo `accessUrl`
  // del catálogo), así que si el pedido tiene varias guías distintas,
  // el email de entrega incluye un bloque separado por cada una — nunca
  // se mezclan ni se manda solo el de la primera.
  const items = (order.items || []).map((item) => ({
    name: item.name,
    accessUrl: getProductBySlug(item.slug)?.accessUrl || null,
  }));

  if (finalBuyerInfo?.email) {
    try {
      await sendOrderDeliveryEmail({
        toEmail: finalBuyerInfo.email,
        toName: finalBuyerInfo.name,
        items,
      });
    } catch (err) {
      console.error("[MAIL] No se ha podido enviar el email de entrega:", err.message);
    }
  } else {
    console.error(`[MAIL] Pedido ${order.id} pagado sin email de entrega: no se ha podido entregar por email.`);
  }
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

    const order = await findOrderById(orderId);
    if (!order || order.userId !== userId) return;

    await deliverPaidOrder(order, extractBuyerInfoFromSession(session), session.amount_total);
  } catch (err) {
    console.error("[STRIPE] No se ha podido confirmar la sesión de pago:", err.message);
  }
}
