"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { useSession } from "@/components/session-provider";
import { useLoading } from "@/components/loading-overlay";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function CarritoPage() {
  const { items, updateQuantity, removeItem, total, clearCart, ready } = useCart();
  const { user } = useSession();
  const { withLoading } = useLoading();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (!user) {
      router.push("/login");
      return;
    }
    setPlacing(true);
    setError("");
    try {
      await withLoading(async () => {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se ha podido crear el pedido.");
        clearCart();
        router.push("/cuenta");
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-4xl">Tu carrito</h1>

      {!user ? (
        <p className="mt-6 text-[var(--ink-soft)]">
          Necesitas una cuenta para tener un carrito.{" "}
          <Link href="/login" className="underline">
            Inicia sesión o regístrate
          </Link>{" "}
          — si ya habías añadido productos antes, seguirán ahí en cuanto entres.
        </p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-[var(--ink-soft)]">
          Todavía no has añadido nada.{" "}
          <Link href="/productos" className="underline">
            Ver catálogo
          </Link>
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.slug}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-[var(--ink-soft)]">{formatPrice(item.price)} / ud.</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.slug, Number(e.target.value))}
                  className="w-16 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-center text-[var(--ink)]"
                />
                <button
                  onClick={() => removeItem(item.slug)}
                  className="text-sm text-[var(--ink-soft)] underline hover:text-[var(--ink)]"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="pt-2">
            <Button onClick={handleCheckout} disabled={placing}>
              {placing ? "Procesando…" : "Confirmar pedido"}
            </Button>
          </div>
          <p className="text-xs text-[var(--ink-soft)]">
            El pago todavía no está conectado — esto guarda el pedido en tu cuenta como demo.
          </p>
        </div>
      )}
    </div>
  );
}
