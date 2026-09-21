"use client";

import { useState } from "react";
import Link from "next/link";
import { useLoading } from "@/components/loading-overlay";
import { formatPrice } from "@/lib/utils";

/**
 * Lista de pedidos de "Mi cuenta", con opción de eliminar cada uno.
 * Recibe los pedidos iniciales ya cargados en el servidor (por sesión,
 * nunca por algo que venga del cliente) y a partir de ahí gestiona el
 * borrado de forma optimista en el propio navegador.
 */
export function OrdersList({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [confirmingId, setConfirmingId] = useState(null);
  const [error, setError] = useState("");
  const { withLoading } = useLoading();

  async function handleDelete(orderId) {
    setError("");
    try {
      await withLoading(async () => {
        const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "No se ha podido eliminar el pedido.");
        }
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setConfirmingId(null);
      });
    } catch (err) {
      setError(err.message);
    }
  }

  if (orders.length === 0) {
    return (
      <p className="mt-4 text-sm text-[var(--ink-soft)]">
        Todavía no tienes ningún pedido.{" "}
        <Link href="/productos" className="underline">
          Ir al catálogo
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {error && <p className="text-sm text-rose-400">{error}</p>}
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between text-sm text-[var(--ink-soft)]">
            <span>{new Date(order.createdAt).toLocaleDateString("es-ES")}</span>
            <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-medium capitalize text-[var(--ink)]">
              {order.status}
            </span>
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {order.items.map((item) => (
              <li key={item.slug} className="flex justify-between">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="font-medium">Total</span>
            <span className="font-medium">{formatPrice(order.total)}</span>
          </div>

          <div className="mt-3 flex justify-end border-t border-[var(--border)] pt-3">
            {confirmingId === order.id ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-[var(--ink-soft)]">¿Eliminar este pedido?</span>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="font-medium text-rose-400 hover:text-rose-300"
                >
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setConfirmingId(null)}
                  className="text-[var(--ink-soft)] hover:text-[var(--ink)]"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingId(order.id)}
                className="text-sm text-[var(--ink-soft)] underline hover:text-rose-400"
              >
                Eliminar pedido
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
