"use client";

import { Analytics } from "@vercel/analytics/react";
import { useCookieConsent } from "./cookie-consent-provider";

/**
 * Vercel Analytics, pero solo cuando la persona ha aceptado la categoría
 * "analíticas" en el banner de cookies (ver cookie-consent-provider.js).
 * Nada de esto se carga —ni siquiera el script— hasta ese momento, y en
 * cuanto la persona rechaza o cambia de opinión en el panel de
 * preferencias, este componente deja de montar <Analytics /> de
 * inmediato (Vercel Analytics no usa cookies para identificar a nadie,
 * pero lo tratamos igual que cualquier medición de visitas: solo con
 * consentimiento, igual que el resto de la web).
 */
export function ConsentedAnalytics() {
  const { preferences, hydrated } = useCookieConsent();

  if (!hydrated || !preferences.analytics) return null;

  return <Analytics />;
}
