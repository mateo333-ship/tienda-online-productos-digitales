"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useCookieConsent } from "./cookie-consent-provider";

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-[var(--accent)]" : "bg-[var(--surface-2)]"
      } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-[var(--ink)] transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function CategoryRow({ title, description, checked, onChange, disabled, alwaysOnLabel }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-[var(--border)] py-4 first:border-t-0 first:pt-0">
      <div>
        <p className="font-medium text-[var(--ink)]">{title}</p>
        <p className="mt-1 text-xs text-[var(--ink-soft)]">{description}</p>
        {alwaysOnLabel && (
          <p className="mt-1 text-xs font-medium text-[var(--accent)]">{alwaysOnLabel}</p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} label={title} />
    </div>
  );
}

/**
 * Panel de preferencias de cookies. Es el mismo componente tanto si se
 * abre desde "Personalizar" en el aviso inicial como desde el botón
 * flotante de más adelante — solo hay un sitio con la lista de
 * categorías, para no tener que mantener dos versiones sincronizadas.
 */
export function CookiePreferencesModal() {
  const { panelOpen, closePanel, draftDefaults, savePreferences, acceptAll, rejectAll } =
    useCookieConsent();
  const [draft, setDraft] = useState(draftDefaults);

  // Cada vez que se abre el panel, partimos de la última decisión
  // guardada (o de "todo desactivado" si nunca hubo una), no de lo que
  // quedara sin guardar la última vez que se abrió y se cerró sin elegir.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia el borrador cada vez que se abre el panel, a partir de la última decisión guardada
    if (panelOpen) setDraft(draftDefaults);
  }, [panelOpen, draftDefaults]);

  useEffect(() => {
    if (!panelOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panelOpen, closePanel]);

  if (!panelOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-preferences-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePanel();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <h2 id="cookie-preferences-title" className="font-serif text-2xl">
            Preferencias de cookies
          </h2>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Cerrar"
            className="shrink-0 text-xl leading-none text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            ×
          </button>
        </div>

        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Elige qué cookies quieres permitir. Puedes volver a cambiarlo cuando quieras desde el
          botón de cookies, abajo a la izquierda. Más información en nuestra{" "}
          <Link href="/cookies" className="underline hover:text-[var(--ink)]" onClick={closePanel}>
            Política de cookies
          </Link>
          .
        </p>

        <div className="mt-4">
          <CategoryRow
            title="Necesarias"
            description="Imprescindibles para que la tienda funcione: iniciar sesión, mantener el carrito y procesar pedidos."
            checked
            disabled
            alwaysOnLabel="Siempre activas"
            onChange={() => {}}
          />
          <CategoryRow
            title="Analíticas"
            description="Nos ayudan a entender cómo se usa la tienda para mejorarla. Hoy no están en uso; esta categoría queda lista para cuando se activen."
            checked={draft.analytics}
            onChange={(v) => setDraft((d) => ({ ...d, analytics: v }))}
          />
          <CategoryRow
            title="Marketing"
            description="Se usarían para mostrarte promociones relevantes. Hoy no están en uso; esta categoría queda lista para cuando se activen."
            checked={draft.marketing}
            onChange={(v) => setDraft((d) => ({ ...d, marketing: v }))}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" className="!px-5 !py-2 text-sm" onClick={rejectAll}>
            Rechazar no esenciales
          </Button>
          <Button variant="outline" className="!px-5 !py-2 text-sm" onClick={() => savePreferences(draft)}>
            Guardar preferencias
          </Button>
          <Button className="!px-5 !py-2 text-sm" onClick={acceptAll}>
            Aceptar todo
          </Button>
        </div>
      </div>
    </div>
  );
}
