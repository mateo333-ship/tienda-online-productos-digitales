import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { listOrdersForUser } from "@/server/auth/orders-repo";
import { confirmCheckoutSession } from "@/server/payments/stripe";
import { getProductBySlug } from "@/lib/products";
import { LogoutButton } from "./logout-button";
import { OrdersList } from "./orders-list";

export const metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

export default async function CuentaPage({ searchParams }) {
  // Comprobación de sesión en el servidor: si no hay sesión válida, ni
  // siquiera se llega a pedir los pedidos de nadie.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Cuando Stripe redirige de vuelta aquí tras un pago, lo hace con
  // ?session_id=... en la URL. Lo comprobamos contra la propia API de
  // Stripe (nunca nos fiamos solo de que la URL diga "pagado") y, si es
  // válido, marcamos el pedido como pagado y limpiamos el carrito antes
  // de volver a cargar la página ya limpia, sin ese parámetro.
  const params = await searchParams;
  if (params?.session_id) {
    await confirmCheckoutSession(params.session_id, user.id);
    redirect("/cuenta?pago=exito");
  }
  const paymentSuccess = params?.pago === "exito";

  // Aquí es donde se garantiza que cada cliente solo ve SUS pedidos: se
  // filtra siempre por el id que viene de la cookie de sesión (cifrada),
  // nunca por algo que se pueda manipular desde el navegador.
  const orders = await listOrdersForUser(user.id);

  // El enlace real de acceso de cada producto se resuelve AQUÍ, en el
  // servidor, y solo para lo que este usuario ya ha pagado — nunca en
  // <OrdersList>, que es un componente de cliente. Si ese componente
  // importara el catálogo completo para mirar el enlace él mismo, todo
  // ese catálogo (con el enlace privado de CADA producto, comprado o no
  // por cualquiera) viajaría dentro del propio JavaScript de la página,
  // un fichero público que cualquiera puede abrir sin haber pagado ni
  // iniciado sesión. Así, <OrdersList> solo llega a ver el enlace de lo
  // que de verdad aparece en el pedido de este usuario, nada más.
  const ordersWithAccess = orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      accessUrl: order.status === "pagado" ? getProductBySlug(item.slug)?.accessUrl ?? null : null,
    })),
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* En móvil, un nombre largo puede partir "Hola, ..." en dos líneas;
          apilamos el botón de cerrar sesión debajo en vez de mantenerlo
          pegado arriba a la derecha, para que nunca quede descuadrado. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">Hola, {user.name}</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      {paymentSuccess && (
        <div className="mt-8 rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 py-3 text-sm">
          ¡Pago recibido correctamente! Ya tienes tu pedido guardado abajo.
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-lg font-medium">Tus pedidos</h2>
        <OrdersList initialOrders={ordersWithAccess} />
      </section>
    </div>
  );
}
