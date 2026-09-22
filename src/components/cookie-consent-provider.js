"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CookieConsentContext = createContext(null);

// Versionado por si en el futuro cambian las categorías (p. ej. se añade
// una nueva): así, un consentimiento guardado con una versión antigua no
// se interpreta como válido para una versión nueva, y se vuelve a
// preguntar en vez de asumir un "sí" que la persona nunca dio para esa
// categoría.
const STORAGE_KEY = "tgs_cookie_consent_v1";

const DEFAULT_DRAFT = { analytics: false, marketing: false };

function readStoredConsent() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { analytics: Boolean(parsed.analytics), marketing: Boolean(parsed.marketing) };
  } catch {
    // localStorage no disponible (navegación privada, permisos, etc.) o
    // valor corrupto: lo tratamos igual que "todavía no ha decidido nada".
    return null;
  }
}

function writeStoredConsent(prefs) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...prefs, decidedAt: new Date().toISOString() })
    );
  } catch {
    // Si no se puede guardar, la preferencia solo dura lo que dure esta
    // pestaña (queda en el estado de React) — no rompemos nada por ello.
  }
}

/**
 * Consentimiento de cookies, con las categorías necesaria (siempre
 * activa) / analíticas / marketing. Se guarda en localStorage, no en una
 * cookie: así el propio hecho de "recordar tu elección" no necesita ya
 * tu consentimiento para funcionar.
 *
 * `preferences` es `null` hasta que sabemos si ya existía una decisión
 * guardada (nunca durante el render del servidor, donde no hay
 * localStorage) — así el banner no aparece ni desaparece de golpe según
 * si `hydrated` todavía no es `true`.
 */
export function CookieConsentProvider({ children }) {
  const [preferences, setPreferences] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    // localStorage no existe durante el render del servidor, así que la
    // única forma de leer una decisión ya guardada es esperar a estar en
    // el navegador y hacerlo aquí, una sola vez al montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de localStorage, no hay forma de saberlo antes de montar
    setPreferences(readStoredConsent());
    setHydrated(true);
  }, []);

  const persist = useCallback((prefs) => {
    const next = { analytics: Boolean(prefs.analytics), marketing: Boolean(prefs.marketing) };
    writeStoredConsent(next);
    setPreferences(next);
    setPanelOpen(false);
  }, []);

  const acceptAll = useCallback(() => persist({ analytics: true, marketing: true }), [persist]);
  const rejectAll = useCallback(() => persist({ analytics: false, marketing: false }), [persist]);
  const savePreferences = useCallback((prefs) => persist(prefs), [persist]);
  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  const value = useMemo(
    () => ({
      // Mientras no haya decisión guardada, el resto de la web puede
      // asumir que no hay consentimiento para nada no esencial.
      preferences: preferences ?? { analytics: false, marketing: false },
      decided: preferences !== null,
      hydrated,
      panelOpen,
      openPanel,
      closePanel,
      acceptAll,
      rejectAll,
      savePreferences,
      draftDefaults: preferences ?? DEFAULT_DRAFT,
    }),
    [preferences, hydrated, panelOpen, openPanel, closePanel, acceptAll, rejectAll, savePreferences]
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent debe usarse dentro de <CookieConsentProvider>");
  return ctx;
}
