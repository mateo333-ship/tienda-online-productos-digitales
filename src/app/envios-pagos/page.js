import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { LEGAL_INFO } from "@/lib/legal-info";

export const metadata = {
  title: "Entrega y pagos",
  description: "Cómo se entregan tus compras y qué métodos de pago aceptamos en The God Supplier.",
};

const UPDATED = "22 de septiembre de 2026";

export default function EnviosPagosPage() {
  return (
    <LegalPage
      title="Entrega y pagos"
      updated={UPDATED}
      intro="Todo lo que vendemos es 100% digital: no hay productos físicos ni envíos postales. Aquí te explicamos cómo se paga y cómo recibes exactamente lo que has comprado."
    >
      <LegalSection heading="1. Métodos de pago">
        <p>
          El pago se procesa a través de Stripe, en su propia página de pago segura. Aceptamos
          tarjeta de crédito o débito; los métodos exactos disponibles pueden variar según tu país.
          Nunca vemos ni guardamos los datos completos de tu tarjeta: los introduces directamente en
          Stripe.
        </p>
        <p>Todos los precios se muestran en euros (€) e incluyen los impuestos aplicables.</p>
      </LegalSection>

      <LegalSection heading="2. Cuándo se cobra">
        <p>
          El cobro se realiza en el momento de confirmar el pedido, no antes. Si el pago no llega a
          completarse (por ejemplo, la tarjeta es rechazada o cierras la página de Stripe antes de
          terminar), el pedido queda marcado como pendiente o fallido y no se te cobra ni se te
          entrega ningún producto.
        </p>
      </LegalSection>

      <LegalSection heading="3. Cómo se entrega tu compra">
        <p>
          En cuanto Stripe confirma el pago, la entrega es inmediata y totalmente automática, sin
          intervención manual:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Recibes un email con el enlace de acceso al contenido que has comprado.</li>
          <li>
            Ese mismo enlace queda también guardado como respaldo en{" "}
            <Link href="/cuenta" className="underline hover:text-[var(--ink)]">
              Mi cuenta
            </Link>
            , dentro del pedido correspondiente, por si el email no llega o lo pierdes.
          </li>
        </ul>
        <p>
          No hay gastos de envío, ni plazos de entrega que esperar, ni seguimiento de paquete: al
          ser contenido digital, el acceso es inmediato y de por vida (salvo que la ficha de un
          producto concreto indique lo contrario).
        </p>
      </LegalSection>

      <LegalSection heading="4. Si no recibes el email de entrega">
        <p>Si tras completar el pago no ves el email de entrega, prueba en este orden:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Revisa la carpeta de spam o promociones de tu correo.</li>
          <li>
            Entra en{" "}
            <Link href="/cuenta" className="underline hover:text-[var(--ink)]">
              Mi cuenta
            </Link>{" "}
            — si el pedido aparece como &ldquo;Pagado&rdquo;, el enlace de acceso está ahí como
            respaldo.
          </li>
          <li>
            Si aun así no lo encuentras, escríbenos a {LEGAL_INFO.email} o desde la página de{" "}
            <Link href="/contacto" className="underline hover:text-[var(--ink)]">
              contacto
            </Link>{" "}
            indicando el email con el que compraste.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Devoluciones">
        <p>
          Al ser contenido digital de entrega inmediata, el derecho de desistimiento tiene una
          excepción legal que se aplica en cuanto empieza la entrega — el detalle completo está en
          la sección correspondiente de nuestros{" "}
          <Link href="/terminos" className="underline hover:text-[var(--ink)]">
            Términos y condiciones
          </Link>
          . Esto no significa que te dejemos solo ante un problema real: si el enlace no funciona,
          el contenido no coincide con lo anunciado, o hay cualquier otra incidencia con tu compra,
          escríbenos y lo resolvemos.
        </p>
      </LegalSection>

      <LegalSection heading="6. Facturación">
        <p>
          Si necesitas una factura de tu compra, escríbenos a {LEGAL_INFO.email} indicando el
          pedido y tus datos de facturación.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
