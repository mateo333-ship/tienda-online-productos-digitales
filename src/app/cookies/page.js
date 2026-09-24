import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { LEGAL_INFO } from "@/lib/legal-info";

export const metadata = {
  title: "Política de cookies",
  description: "Qué cookies usamos en The God Supplier y cómo puedes gestionarlas.",
  alternates: { canonical: "/cookies" },
};

const UPDATED = "22 de septiembre de 2026";

export default function CookiesPage() {
  return (
    <LegalPage
      title="Política de cookies"
      updated={UPDATED}
      intro="Una cookie es un pequeño archivo que una web guarda en tu navegador para recordar información entre visitas. Aquí explicamos cuáles usamos, para qué, y cómo puedes gestionarlas."
    >
      <LegalSection heading="1. Cómo gestionar tus preferencias en esta web">
        <p>
          La primera vez que visitas la web te preguntamos qué categorías de cookies aceptas.
          Puedes cambiar esa decisión cuando quieras: abajo a la izquierda de la pantalla hay un
          botón con forma de cookie que abre de nuevo el panel de preferencias.
        </p>
      </LegalSection>

      <LegalSection heading="2. Cookies que usamos actualmente">
        <p>
          Esta web instala siempre las cookies estrictamente necesarias. Además, si aceptas la
          categoría &ldquo;Analíticas&rdquo; en el panel de preferencias, se instalan también las
          cookies de Google Analytics que aparecen en la tabla; si no la aceptas, esas cookies no
          llegan a instalarse.
        </p>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-2)] text-[var(--ink)]">
              <tr>
                <th className="px-4 py-3 font-medium">Cookie</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Finalidad</th>
                <th className="px-4 py-3 font-medium">Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-mono">tienda_session</td>
                <td className="px-4 py-3">Necesaria, propia</td>
                <td className="px-4 py-3">
                  Mantiene tu sesión iniciada para que puedas ver tu cuenta y tus pedidos. Va
                  cifrada y no se puede leer ni modificar desde el navegador.
                </td>
                <td className="px-4 py-3">7 días</td>
              </tr>
              <tr className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-mono">_ga</td>
                <td className="px-4 py-3">Analítica, Google</td>
                <td className="px-4 py-3">
                  Distingue a los distintos visitantes de la web (Google Analytics). Solo se
                  instala si aceptas la categoría &ldquo;Analíticas&rdquo;.
                </td>
                <td className="px-4 py-3">2 años</td>
              </tr>
              <tr className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-mono">_ga_&lt;id&gt;</td>
                <td className="px-4 py-3">Analítica, Google</td>
                <td className="px-4 py-3">
                  Mantiene el estado de tu sesión de navegación para Google Analytics. Solo se
                  instala si aceptas la categoría &ldquo;Analíticas&rdquo;.
                </td>
                <td className="px-4 py-3">2 años</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Además, tu elección de cookies se guarda en el almacenamiento local de tu navegador
          (localStorage), no como una cookie tradicional, para recordar tu decisión en tus
          próximas visitas.
        </p>
        <p>
          También usamos Vercel Analytics, una herramienta de estadísticas de visitas que, según
          la propia política de privacidad de Vercel, no instala ninguna cookie ni guarda datos
          que identifiquen a una persona concreta.
        </p>
      </LegalSection>

      <LegalSection heading="3. Categorías del panel de preferencias">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-[var(--ink)]">Necesarias</strong> — imprescindibles para que la
            tienda funcione (iniciar sesión, mantener el carrito, procesar pedidos). No requieren tu
            consentimiento y no se pueden desactivar.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Analíticas</strong> — nos ayudan a entender cómo
            se usa la web para mejorarla (por ejemplo, qué páginas se visitan más), mediante Google
            Analytics y Vercel Analytics. Solo se activan si das tu consentimiento, y puedes
            retirarlo cuando quieras desde el panel de preferencias.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Marketing</strong> — se usarían para mostrar
            promociones relevantes dentro o fuera de esta web. No están activas todavía; se
            activarían únicamente con tu consentimiento si en el futuro se incorporan.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. Cookies de terceros">
        <p>
          Cuando pagas un pedido, te llevamos a la página de pago alojada por Stripe. Esa página
          vive en el dominio de Stripe, no en el nuestro, y puede instalar sus propias cookies según
          su propia política, ajena a esta web. Puedes consultarla directamente en la web de
          Stripe.
        </p>
      </LegalSection>

      <LegalSection heading="5. Cómo desactivar las cookies desde el navegador">
        <p>
          Además del panel de preferencias de esta web, puedes bloquear o eliminar cookies desde la
          configuración de tu propio navegador. Ten en cuenta que bloquear la cookie{" "}
          <span className="font-mono">tienda_session</span> impedirá que puedas mantener la sesión
          iniciada.
        </p>
      </LegalSection>

      <LegalSection heading="6. Más información">
        <p>
          Para saber qué hacemos con los datos que tratamos a través de cookies y otras vías,
          consulta nuestra{" "}
          <Link href="/privacidad" className="underline hover:text-[var(--ink)]">
            Política de privacidad
          </Link>
          . Para cualquier duda, escríbenos a {LEGAL_INFO.email}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
