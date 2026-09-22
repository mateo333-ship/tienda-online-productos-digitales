"use client";

import { useState } from "react";
import Link from "next/link";
import { useLoading } from "@/components/loading-overlay";
import { formatPrice } from "@/lib/utils";

const STATUS_LABELS = {
  pendiente: "Pendiente",
  pendiente_pago: "Pendiente de pago",
  pagado: "Pagado",
  fallido: "Pago fallido",
};

const STATUS_STYLES = {
  pagado: "bg-[var(--accent)]/15 text-[var(--accent)]",
  pendiente_pago: "bg-[var(--surface-2)] text-[var(--ink-soft)]",
  fallido: "bg-rose-500/15 text-rose-400",
};

function StatusPill({ status }) {
  const style = STATUS_STYLES[status] ?? "bg-[var(--surface-2)] text-[var(--ink)]";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${style}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

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
            <StatusPill status={order.status} />
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {order.items.map((item) => {
              // El acceso "de verdad" se manda por email en cuanto se
              // confirma el pago; este enlace es solo un respaldo por si
              // ese email no llegó o se perdió. Ya viene resuelto desde
              // el servidor (ver cuenta/page.js) — este componente nunca
              // toca el catálogo directamente, para que su enlace privado
              // no acabe en el JavaScript público de la página.
              const accessUrl = item.accessUrl;
              return (
                <li key={item.slug}>
                  <div className="flex justify-between">
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                  {accessUrl && (
                    <a
                      href={accessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs font-medium text-[var(--accent)] underline"
                    >
                      Acceder ahora
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
            <span className="font-medium">Total</span>
            <span className="font-medium">{formatPrice(order.total)}</span>
          </div>

          {/* Un pedido "pagado" es el historial real de una compra (y la
              prueba de que se entregó el acceso): no se ofrece la opción
              de eliminarlo, ni siquiera se ve el botón — se queda en la
              cuenta para siempre. Solo se puede quitar un pedido que
              todavía no se llegó a pagar (pendiente o fallido), por
              ejemplo para limpiar un intento de compra que no se
              completó. El servidor vuelve a comprobar esto de todas
              formas (ver /api/orders/[id]), así que aunque alguien
              manipulase el navegador, un pedido pagado no se puede
              borrar. */}
          {order.status !== "pagado" && (
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
          )}
        </div>
      ))}
    </div>
  );
}
