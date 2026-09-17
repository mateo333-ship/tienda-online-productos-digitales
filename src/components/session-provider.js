"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLoading } from "./loading-overlay";

/**
 * Estado de sesión compartido por toda la web (quién ha iniciado sesión,
 * si es que hay alguien). Sustituye al antiguo hook `useSessionUser`, que
 * solo comprobaba la sesión una vez al montar la cabecera: por eso, justo
 * después de iniciar sesión, la cabecera seguía diciendo "Iniciar sesión"
 * hasta que recargabas la página a mano.
 *
 * Ahora el login, el registro/verificación y el cierre de sesión
 * actualizan este estado directamente en cuanto el servidor responde
 * (con `setUser`), así que la cabecera se pone al día al instante, sin
 * depender de recargar nada.
 */
const SessionContext = createContext(undefined);

export function SessionProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = comprobando todavía
  const { withLoading } = useLoading();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Comprobación de sesión al cargar (o recargar) la página: mientras
    // dura, el overlay de carga cubre la pantalla, así nunca se ve un
    // "Iniciar sesión" a medio actualizar.
    withLoading(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  return (
    <SessionContext.Provider value={{ user, setUser, refresh }}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
