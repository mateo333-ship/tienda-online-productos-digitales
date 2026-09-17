"use client";

import { createContext, useCallback, useContext, useState } from "react";

/**
 * Overlay de carga a pantalla completa, para acciones "importantes" que
 * hablan con el servidor (iniciar/cerrar sesión, crear cuenta, verificar
 * el código, confirmar un pedido, enviar el formulario de contacto, y la
 * comprobación de sesión que se hace al cargar la página). No se usa para
 * navegar entre páginas con enlaces normales — eso ya es instantáneo por
 * sí solo y no necesita overlay.
 *
 * Usa un contador en vez de un simple booleano para que, si dos acciones
 * se solapasen alguna vez, el overlay no desaparezca hasta que las dos
 * hayan terminado de verdad.
 */
const LoadingContext = createContext(undefined);

export function LoadingProvider({ children }) {
  const [count, setCount] = useState(0);

  const start = useCallback(() => setCount((c) => c + 1), []);
  const stop = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  const withLoading = useCallback(
    async (fn) => {
      start();
      try {
        return await fn();
      } finally {
        stop();
      }
    },
    [start, stop]
  );

  return (
    <LoadingContext.Provider value={{ active: count > 0, start, stop, withLoading }}>
      {children}
      {count > 0 && <LoadingOverlay />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading debe usarse dentro de <LoadingProvider>");
  return ctx;
}

function LoadingOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="relative flex h-12 w-12 items-center justify-center">
          <span className="absolute h-full w-full animate-ping rounded-full bg-[var(--accent)]/30" />
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
        </span>
        <span className="text-xs font-medium tracking-wide text-[var(--ink-soft)]">
          Cargando…
        </span>
      </div>
      <span className="sr-only">Cargando, un momento…</span>
    </div>
  );
}
