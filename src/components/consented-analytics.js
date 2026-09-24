"use client";

import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { useCookieConsent } from "./cookie-consent-provider";

// ID de medición de Google Analytics 4 (empieza por "G-"). Se pone como
// variable de entorno (NEXT_PUBLIC_GA_ID en Vercel), nunca escrito a mano
// aquí: así, si el día de mañana cambia de cuenta o de propiedad de
// Analytics, se actualiza en Vercel sin tocar ni volver a desplegar
// código. Mientras esa variable no exista, Google Analytics simplemente
// no se carga (Vercel Analytics sigue funcionando igual que hasta ahora).
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Analíticas de la tienda, cargadas solo cuando la persona ha aceptado
 * la categoría "analíticas" en el banner de cookies (ver
 * cookie-consent-provider.js). Nada de esto se carga —ni siquiera el
 * script— hasta ese momento, y en cuanto la persona rechaza o cambia de
 * opinión en el panel de preferencias, este componente deja de montar
 * ambas herramientas de inmediato.
 *
 * Dos herramientas a la vez, cada una por lo que aporta:
 *   - Vercel Analytics: no usa cookies (identifica visitas con un hash
 *     que se descarta cada 24h), así que no puede distinguir "nuevo" de
 *     "recurrente" entre días — a cambio, es la vista rápida integrada
 *     en el propio panel de Vercel, sin nada más que configurar.
 *   - Google Analytics (GA4): sí usa cookies propias (`_ga`,
 *     `_ga_<id>` — ver política de cookies) que persisten entre
 *     visitas, así que SÍ puede decir si un visitante ya había estado
 *     antes, además de dar informes mucho más detallados (embudos,
 *     duración de sesión, etc.).
 */
export function ConsentedAnalytics() {
  const { preferences, hydrated } = useCookieConsent();

  if (!hydrated || !preferences.analytics) return null;

  return (
    <>
      <Analytics />
      {GA_MEASUREMENT_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
          <Script id="google-analytics-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
