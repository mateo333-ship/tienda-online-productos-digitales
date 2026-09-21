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
//
// El nombre, el email de entrega y el teléfono del comprador NO se piden
// aquí ni en el carrito: se piden directamente en la propia pantalla de
// pago de Stripe (email de contacto + teléfono, nativos de Checkout, y
// "Nombre completo" como campo personalizado, más abajo), junto al
// código de descuento — todo en un único sitio. Stripe nos los devuelve
// después, al confirmar el pago (ver deliverPaidOrder en
// src/server/payments/stripe.js).
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
    // el resto de la web se pueda seguir probando sin cortar nada. Aquí
    // no hay pantalla de Stripe que recoja nombre/email/teléfono, así
    // que el pedido se guarda sin `buyerInfo` (no hay a quién entregarlo
    // por email en modo demo).
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
      // Sin `customer` ni `customer_email`: así el campo de email queda
      // editable en la propia pantalla de Stripe, en vez de venir ya
      // fijado desde aquí.
      line_items: resolvedItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: item.price,
          product_data: { name: item.name },
        },
      })),
      // Pide el teléfono en la propia pantalla de pago.
      phone_number_collection: { enabled: true },
      // Campo personalizado para el nombre completo, junto a los demás
      // datos — así no hace falta un formulario aparte en el carrito.
      custom_fields: [
        {
          key: "nombre_completo",
          label: { type: "custom", custom: "Nombre completo" },
          type: "text",
          optional: false,
        },
      ],
      // Crea automáticamente un Cliente de Stripe con los datos que el
      // comprador acaba de rellenar (email, teléfono...), para que
      // también se vean en "Clientes" dentro del panel de Stripe.
      customer_creation: "always",
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
