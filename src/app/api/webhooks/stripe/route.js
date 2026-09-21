import { NextResponse } from "next/server";
import {
  getStripeClient,
  isStripeConfigured,
  deliverPaidOrder,
  extractBuyerInfoFromSession,
} from "@/server/payments/stripe";
import { setOrderStatus, findOrderById } from "@/server/auth/orders-repo";

/**
 * ------------------------------------------------------------------
 *  Webhook de Stripe: la confirmación "de verdad" de que se ha pagado
 * ------------------------------------------------------------------
 * La vuelta del cliente a /cuenta tras pagar (ver src/server/payments/
 * stripe.js → confirmCheckoutSession) ya marca el pedido como pagado al
 * momento, pero no es 100% fiable por sí sola: el cliente podría cerrar
 * la pestaña, perder la conexión, o el método de pago podría tardar en
 * confirmarse (algunos no son instantáneos). Este webhook es la fuente
 * de verdad: Stripe nos avisa directamente a este endpoint en cuanto el
 * pago se confirma de verdad, pase lo que pase en el navegador del
 * cliente. Marcar el mismo pedido como pagado dos veces no hace nada
 * raro, así que no importa si los dos caminos coinciden.
 *
 * Importante: leemos el cuerpo como texto plano (`req.text()`) ANTES de
 * interpretarlo, porque la verificación de la firma de Stripe necesita
 * los bytes exactos tal cual los mandó Stripe — si lo pasáramos primero
 * por `req.json()`, la firma ya no coincidiría.
 * ------------------------------------------------------------------
 */
export async function POST(req) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[STRIPE WEBHOOK] Ha llegado un webhook pero Stripe no está configurado.");
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[STRIPE WEBHOOK] Firma inválida, se ignora:", err.message);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (orderId && session.payment_status === "paid") {
        const order = await findOrderById(orderId);
        // `deliverPaidOrder` ya comprueba que el pedido no estuviera
        // pagado de antes, así que si la vuelta del cliente a /cuenta se
        // adelantó a este webhook, aquí simplemente no se hace nada más
        // (y sobre todo, no se manda el email de entrega dos veces).
        if (order && (!userId || order.userId === userId)) {
          await deliverPaidOrder(order, extractBuyerInfoFromSession(session));
        }
      }
    } else if (event.type === "checkout.session.async_payment_failed") {
      const orderId = event.data.object.metadata?.orderId;
      if (orderId) await setOrderStatus(orderId, "fallido");
    }
  } catch (err) {
    // Si devolviéramos un error aquí, Stripe reintentaría este mismo
    // evento indefinidamente. Mejor dejarlo registrado en los Logs y
    // responder 200: el pedido se queda como estaba y se puede revisar
    // a mano si hiciera falta.
    console.error("[STRIPE WEBHOOK] Error procesando el evento:", err);
  }

  return NextResponse.json({ received: true });
}
