"use client";

import { useCookieConsent } from "./cookie-consent-provider";

function CookieIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3a9 9 0 1 0 9 9c-1.5 0-2.5-.5-2.5-2s1-1.5 1-2.5c0-1-.7-1.5-1.7-1.5-1.2 0-1.8-.8-1.8-1.8 0-.8.4-1.3.4-2.1C16.4 1.4 14.4 3 12 3Z"
      />
      <circle cx="8.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="16" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Botón flotante para reabrir las preferencias de cookies, una vez que
 * ya se ha aceptado, rechazado o personalizado algo (mientras no hay
 * ninguna decisión guardada, el propio aviso de cookies de abajo cumple
 * esa función, así que no se muestran los dos a la vez).
 */
export function CookieSettingsButton() {
  const { hydrated, decided, panelOpen, openPanel } = useCookieConsent();

  if (!hydrated || !decided || panelOpen) return null;

  return (
    <button
      type="button"
      onClick={openPanel}
      aria-label="Preferencias de cookies"
      title="Preferencias de cookies"
      // En la esquina inferior DERECHA, no izquierda: casi todo el texto de
      // la web (títulos, párrafos) empieza pegado al borde izquierdo, así
      // que un botón fijo ahí acababa tapando la última línea de titulares
      // largos al hacer scroll en móvil (comprobado en "Lo más querido" y
      // en el propio título de cada producto). La derecha rara vez tiene
      // texto pegado al borde.
      className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-soft)] shadow-lg shadow-black/40 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      <CookieIcon className="h-6 w-6" />
    </button>
  );
}
