import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { listOrdersForUser } from "@/server/auth/orders-repo";
import { LogoutButton } from "./logout-button";
import { OrdersList } from "./orders-list";

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
        <OrdersList initialOrders={orders} />
      </section>
    </div>
  );
}
