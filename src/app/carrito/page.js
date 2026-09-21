"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { useSession } from "@/components/session-provider";
import { useLoading } from "@/components/loading-overlay";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

// Si Stripe nos devuelve aquí tras cancelar el pago, lo leemos solo en el
// navegador (no hace falta que este aviso pase por el servidor). La página
// ya no renderiza nada hasta que el carrito está listo (`ready`), así que
// este valor inicial "perezoso" nunca puede desajustarse con lo que
// hubiera mandado el servidor.
function readCancelledFromUrl() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("pago") === "cancelado";
}

export default function CarritoPage() {
  const { items, updateQuantity, removeItem, total, clearCart, ready } = useCart();
  const { user } = useSession();
  const { withLoading } = useLoading();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [cancelled] = useState(readCancelledFromUrl);

  async function handleCheckout() {
    if (!user) {
      router.push("/login");
      return;
    }
    setPlacing(true);
    setError("");
    try {
      await withLoading(async () => {
        const res = await fetch("/api/checkout", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se ha podido iniciar el pago.");

        if (data.mode === "stripe") {
          // Salimos de la web hacia la página de pago de Stripe. El
          // overlay de carga se queda visible hasta ese momento, así que
          // no hace falta "apagarlo" a mano aquí.
          window.location.href = data.url;
          return;
        }

        // Modo demo (Stripe todavía no configurado): el pedido ya se ha
        // guardado directamente en el servidor.
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

      {cancelled && (
        <p className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink-soft)]">
          Has cancelado el pago. Tu carrito sigue aquí tal cual lo dejaste.
        </p>
      )}

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
              {placing ? "Procesando…" : "Pagar todo el carrito"}
            </Button>
          </div>
          <p className="text-xs text-[var(--ink-soft)]">
            Un único pago seguro cubre todos los productos del carrito, sin cobros por separado.
          </p>
        </div>
      )}
    </div>
  );
}
