"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "tienda:carrito";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  // El carrito es solo una conveniencia de cliente (nada sensible), así
  // que localStorage es perfecto aquí — no hay datos personales dentro.
  useEffect(() => {
    // Cargamos el carrito guardado después del montaje inicial (nunca
    // durante el render en sí) para que coincida con el HTML generado por
    // el servidor y evitar "hydration mismatches".
    let raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage no disponible (modo privado, permisos, etc.).
    }
    if (raw) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratación intencionada desde localStorage tras el montaje
        setItems(JSON.parse(raw));
      } catch {
        // JSON corrupto: seguimos con carrito vacío.
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Igual de arriba: si falla, no rompemos la experiencia.
    }
  }, [items, ready]);

  function addItem(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === product.slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === product.slug ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        { slug: product.slug, name: product.name, price: product.price, quantity },
      ];
    });
  }

  function updateQuantity(slug, quantity) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) => (i.slug === slug ? { ...i, quantity } : i))
    );
  }

  function removeItem(slug) {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }

  function clearCart() {
    setItems([]);
  }

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, total, count, ready }}
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
