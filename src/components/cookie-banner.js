"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useCookieConsent } from "./cookie-consent-provider";

/**
 * Aviso de cookies que aparece la primera vez que alguien visita la web
 * (mientras no haya una decisión guardada). En cuanto se acepta,
 * rechaza o personaliza, desaparece para siempre y su función la toma el
 * botón flotante (ver cookie-settings-button.js), así no se duplica el
 * mismo control dos veces en la misma esquina.
 */
export function CookieBanner() {
  const { hydrated, decided, panelOpen, openPanel, acceptAll, rejectAll } = useCookieConsent();

  if (!hydrated || decided || panelOpen) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-5 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] sm:px-6"
      role="region"
      aria-label="Aviso de cookies"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--ink-soft)]">
          Usamos cookies necesarias para que la tienda funcione (iniciar sesión, carrito,
          pedidos). Con tu permiso, en el futuro también podríamos usar cookies de analítica o
          marketing. Puedes elegir qué permitir o leer más en nuestra{" "}
          <Link href="/cookies" className="underline hover:text-[var(--ink)]">
            Política de cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openPanel}
            className="text-sm font-medium text-[var(--ink-soft)] underline hover:text-[var(--ink)]"
          >
            Personalizar
          </button>
          <Button variant="outline" className="!px-5 !py-2 text-sm" onClick={rejectAll}>
            Rechazar no esenciales
          </Button>
          <Button className="!px-5 !py-2 text-sm" onClick={acceptAll}>
            Aceptar todo
          </Button>
        </div>
      </div>
    </div>
  );
}
