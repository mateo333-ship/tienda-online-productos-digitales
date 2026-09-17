"use client";

import { useEffect, useState } from "react";

/**
 * Hook de cliente para saber si hay alguien logueado, usado por la
 * cabecera para mostrar "Mi cuenta" o "Iniciar sesión". La comprobación
 * real y de confianza siempre se hace en el servidor (cookie cifrada);
 * esto es solo para adaptar la interfaz.
 */
export function useSessionUser() {
  const [user, setUser] = useState(undefined); // undefined = cargando

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (active) setUser(data.user ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      });
    return () => {
      active = false;
    };
  }, []);

  return user;
}
