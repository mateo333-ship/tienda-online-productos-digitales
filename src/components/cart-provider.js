"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "./session-provider";
import { useLoading } from "./loading-overlay";

const CartContext = createContext(null);

/**
 * El carrito pertenece a la cuenta, no al navegador: sin sesión no hay
 * carrito (así que no se puede añadir nada), al cerrar sesión el carrito
 * que se ve vuelve a 0, y al volver a iniciar sesión reaparece tal como
 * se dejó (un carrito por cuenta, guardado en el servidor — ver
 * src/app/api/cart/route.js y src/server/auth/cart-repo.js).
 */
export function CartProvider({ children }) {
  const { user } = useSession(); // undefined = comprobando, null = sin sesión
  const { withLoading } = useLoading();
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const loadedForUserId = useRef(null);

  useEffect(() => {
    if (user === undefined) return; // todavía no sabemos si hay sesión

    if (!user) {
      // Sin sesión (o justo después de cerrarla): no hay carrito que mostrar.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- el carrito depende directamente de si hay sesión
      setItems([]);
      loadedForUserId.current = null;
      setReady(true);
      return;
    }

    if (loadedForUserId.current === user.id) {
      setReady(true);
      return;
    }

    withLoading(async () => {
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        const data = await res.json();
        setItems(res.ok ? data.items ?? [] : []);
      } catch {
        setItems([]);
      } finally {
        loadedForUserId.current = user.id;
        setReady(true);
      }
    });
  }, [user, withLoading]);

  const persist = useCallback(
    (nextItems) => {
      if (!user) return;
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: nextItems }),
      }).catch(() => {
        // Si falla el guardado, el carrito sigue funcionando en esta
        // pestaña; se reintentará en el siguiente cambio.
      });
    },
    [user]
  );

  // Devuelve false si no hay sesión, para que quien llame pueda mandar al
  // cliente al formulario de inicio de sesión.
  const addItem = useCallback(
    (product, quantity = 1) => {
      if (!user) return false;
      setItems((prev) => {
        const existing = prev.find((i) => i.slug === product.slug);
        const next = existing
          ? prev.map((i) =>
              i.slug === product.slug ? { ...i, quantity: i.quantity + quantity } : i
            )
          : [...prev, { slug: product.slug, name: product.name, price: product.price, quantity }];
        persist(next);
        return next;
      });
      return true;
    },
    [user, persist]
  );

  const updateQuantity = useCallback(
    (slug, quantity) => {
      setItems((prev) => {
        const next =
          quantity <= 0
            ? prev.filter((i) => i.slug !== slug)
            : prev.map((i) => (i.slug === slug ? { ...i, quantity } : i));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeItem = useCallback(
    (slug) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.slug !== slug);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    persist([]);
  }, [persist]);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        total,
        count,
        ready,
        loggedIn: Boolean(user),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
