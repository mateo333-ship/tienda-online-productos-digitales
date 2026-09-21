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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CarritoPage() {
  const { items, updateQuantity, removeItem, total, clearCart, ready } = useCart();
  const { user } = useSession();
  const { withLoading } = useLoading();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [cancelled] = useState(readCancelledFromUrl);

  // Datos de entrega: al ser productos digitales, necesitamos saber a
  // quién y a qué email mandarle el acceso en cuanto se confirme el
  // pago — no tiene por qué ser el mismo email con el que ha iniciado
  // sesión, así que se piden aquí, justo antes de pagar.
  const [buyerName, setBuyerName] = useState("");
  // Empieza vacío (la sesión se carga de forma asíncrona, así que
  // `user` todavía no existe en el primer render); mientras el cliente
  // no haya escrito nada aquí, se muestra el email de la cuenta como
  // valor por defecto sin necesidad de sincronizarlo con un efecto.
  const [buyerEmailInput, setBuyerEmailInput] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const buyerEmail = buyerEmailInput || user?.email || "";

  const buyerInfoValid = buyerName.trim().length > 0 && EMAIL_RE.test(buyerEmail.trim());

  async function handleCheckout() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!buyerInfoValid) {
      setError("Escribe tu nombre y un email válido para poder enviarte el acceso.");
      return;
    }
    setPlacing(true);
    setError("");
    try {
      await withLoading(async () => {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buyerInfo: {
              name: buyerName.trim(),
              email: buyerEmail.trim(),
              phone: buyerPhone.trim(),
            },
          }),
        });
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
          <p className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-sm">
            ✨ Usa el código <strong className="font-semibold">DIGITAL10</strong> en el pago para
            conseguir un 10% de descuento.
          </p>

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

          <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm font-medium">Datos de entrega</p>
            <p className="text-xs text-[var(--ink-soft)]">
              Al ser productos digitales, te mandamos el acceso a este email en cuanto se confirme
              el pago.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="buyer-name" className="text-xs text-[var(--ink-soft)]">
                  Nombre completo
                </label>
                <input
                  id="buyer-name"
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Tu nombre"
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--ink)]"
                />
              </div>
              <div>
                <label htmlFor="buyer-email" className="text-xs text-[var(--ink-soft)]">
                  Email de entrega
                </label>
                <input
                  id="buyer-email"
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmailInput(e.target.value)}
                  placeholder="tu@email.com"
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--ink)]"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="buyer-phone" className="text-xs text-[var(--ink-soft)]">
                  Teléfono (opcional)
                </label>
                <input
                  id="buyer-phone"
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="600 000 000"
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--ink)]"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="pt-2">
            <Button onClick={handleCheckout} disabled={placing || !buyerInfoValid}>
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
