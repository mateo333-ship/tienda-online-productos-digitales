import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/server/auth/current-user";
import { listOrdersForUser } from "@/server/auth/orders-repo";
import { formatPrice } from "@/lib/utils";
import { LogoutButton } from "./logout-button";

export const metadata = { title: "Mi cuenta — The God Supplier" };

export default async function CuentaPage() {
  // Comprobación de sesión en el servidor: si no hay sesión válida, ni
  // siquiera se llega a pedir los pedidos de nadie.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Aquí es donde se garantiza que cada cliente solo ve SUS pedidos: se
  // filtra siempre por el id que viene de la cookie de sesión (cifrada),
  // nunca por algo que se pueda manipular desde el navegador.
  const orders = await listOrdersForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-4xl">Hola, {user.name}</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-medium">Tus pedidos</h2>

        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--ink-soft)]">
            Todavía no tienes ningún pedido.{" "}
            <Link href="/productos" className="underline">
              Ir al catálogo
            </Link>
          </p>
        ) : (
          <div className="mt-4 space-y-4">
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
                <div className="mt-3 flex justify-between border-t border-[var(--border)] pt-3 font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
