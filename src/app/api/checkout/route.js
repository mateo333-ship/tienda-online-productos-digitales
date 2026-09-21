import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCartForUser, clearCartForUser } from "@/server/auth/cart-repo";
import { createOrderForUser, deleteOrderForUser } from "@/server/auth/orders-repo";
import { getProductBySlug } from "@/lib/products";
import { getStripeClient, isStripeConfigured } from "@/server/payments/stripe";
import { safeRoute } from "@/server/http/safe-route";

// Inicia el pago de TODO el carrito de una vez: un único Checkout Session
// de Stripe con varios `line_items` (uno por producto), así que el
// cliente hace un solo pago que cubre todo, no uno por producto.
export const POST = safeRoute(async (req) => {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const cartItems = await getCartForUser(user.id);
  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Tu carrito está vacío." }, { status: 400 });
  }

  // El precio que se cobra SIEMPRE sale del catálogo del servidor, nunca
  // del que venga guardado en el carrito: así, aunque alguien manipulase
  // su carrito desde las herramientas de desarrollador del navegador, no
  // podría conseguir un precio distinto al real.
  const resolvedItems = [];
  for (const cartItem of cartItems) {
    const product = getProductBySlug(cartItem.slug);
    if (!product) continue; // producto ya no existe en el catálogo: se ignora sin romper el pago
    const quantity = Math.min(Math.max(Math.trunc(cartItem.quantity) || 1, 1), 50);
    resolvedItems.push({ slug: product.slug, name: product.name, price: product.price, quantity });
  }

  if (resolvedItems.length === 0) {
    return NextResponse.json(
      { error: "Ninguno de los productos de tu carrito está ya disponible." },
      { status: 400 }
    );
  }

  const total = resolvedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isStripeConfigured()) {
    // Modo demo: sin Stripe configurado (ver README), seguimos guardando
    // el pedido directamente como hasta ahora, sin cobro real, para que
    // el resto de la web se pueda seguir probando sin cortar nada.
    const order = await createOrderForUser(user.id, { items: resolvedItems, total, status: "pendiente" });
    await clearCartForUser(user.id);
    return NextResponse.json({ ok: true, mode: "demo", order });
  }

  // El pedido se guarda YA (como "pendiente_pago"), antes de mandar al
  // cliente a pagar: así, en cuanto Stripe confirme el pago (por el
  // webhook o al volver a /cuenta), solo hay que marcarlo como pagado.
  const order = await createOrderForUser(user.id, {
    items: resolvedItems,
    total,
    status: "pendiente_pago",
  });

  // Si Stripe fallara justo aquí (clave mal puesta, sin conexión, etc.),
  // no queremos dejar ese pedido "fantasma" a medias, sin ninguna sesión
  // de pago detrás: lo borramos y devolvemos un error normal, como si no
  // se hubiera llegado a crear.
  try {
    const origin = req.headers.get("origin") || new URL(req.url).origin;
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: resolvedItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: item.price,
          product_data: { name: item.name },
        },
      })),
      success_url: `${origin}/cuenta?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrito?pago=cancelado`,
      metadata: { orderId: order.id, userId: user.id },
      // Muestra en la propia pantalla de pago de Stripe un campo para
      // introducir un código de descuento (como el DIGITAL10 del banner y
      // del carrito). Para que ese código funcione de verdad hay que
      // crearlo una vez en el panel de Stripe — ver README, sección
      // "Cobrar con tarjeta (Stripe)".
      allow_promotion_codes: true,
    });

    return NextResponse.json({ ok: true, mode: "stripe", url: session.url });
  } catch (err) {
    await deleteOrderForUser(user.id, order.id);
    console.error("[STRIPE] No se ha podido crear la sesión de pago:", err.message);
    return NextResponse.json(
      { error: "No se ha podido iniciar el pago. Inténtalo de nuevo en unos minutos." },
      { status: 502 }
    );
  }
});
