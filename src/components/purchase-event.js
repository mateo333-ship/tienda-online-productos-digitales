"use client";

import { useEffect } from "react";

// Evita registrar la misma compra dos veces si la persona recarga "Mi
// cuenta" justo después de pagar (la URL se queda con
// ?pago=exito&pedido=... hasta que navega a otra página). Se guarda en
// localStorage, con el mismo criterio de "si no se puede guardar, no pasa
// nada grave" que ya usa cookie-consent-provider.js.
const STORAGE_KEY = "tgs_ga_purchases_v1";

function alreadyTracked(orderId) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const tracked = raw ? JSON.parse(raw) : [];
    return Array.isArray(tracked) && tracked.includes(orderId);
  } catch {
    return false;
  }
}

function markTracked(orderId) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const tracked = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(tracked) ? [...tracked, orderId] : [orderId];
    // Solo hace falta recordar las últimas compras: esto es únicamente
    // para no duplicar el aviso a Analytics, no un historial a conservar.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(-20)));
  } catch {
    // Si no se puede guardar, en el peor caso se contaría esta compra dos
    // veces si recarga la página — no rompe nada más.
  }
}

/**
 * Manda a Google Analytics el evento estándar de "compra" (importe,
 * moneda y productos) en cuanto la persona ve la confirmación de un
 * pedido recién pagado en "Mi cuenta" (ver cuenta/page.js, que solo
 * renderiza este componente para el pedido que se acaba de confirmar).
 *
 * No hace nada si todavía no ha aceptado la categoría "Analíticas" de
 * cookies: en ese caso `window.gtag` directamente no existe (ver
 * consented-analytics.js), así que este evento no llega a ningún sitio —
 * igual que cualquier otra visita mientras no haya consentimiento.
 */
export function PurchaseEvent({ order }) {
  useEffect(() => {
    if (!order || typeof window.gtag !== "function") return;
    if (alreadyTracked(order.id)) return;

    window.gtag("event", "purchase", {
      transaction_id: order.id,
      value: order.total / 100,
      currency: "EUR",
      items: order.items.map((item) => ({
        item_id: item.slug,
        item_name: item.name,
        price: item.price / 100,
        quantity: item.quantity,
      })),
    });

    markTracked(order.id);
    // Solo debe volver a evaluarse si cambia el pedido que nos han
    // pasado (id distinto), no en cada re-render de "Mi cuenta".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  return null;
}
