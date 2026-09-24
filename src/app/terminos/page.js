import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { LEGAL_INFO } from "@/lib/legal-info";

export const metadata = {
  title: "Términos y condiciones",
  description: "Condiciones de uso y de compra en The God Supplier.",
};

const UPDATED = "22 de septiembre de 2026";

export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos y condiciones"
      updated={UPDATED}
      intro="Estas son las condiciones que rigen el uso de esta web y la compra de los productos digitales que se venden en ella. Al comprar o crear una cuenta, las aceptas. Si tienes cualquier duda antes de aceptarlas, puedes escribirnos desde la página de contacto."
    >
      <LegalSection heading="1. Identificación del titular (aviso legal)">
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la
          Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Titular: {LEGAL_INFO.ownerName}</li>
          <li>NIF/CIF: {LEGAL_INFO.taxId}</li>
          <li>Domicilio: {LEGAL_INFO.address}</li>
          <li>Email de contacto: {LEGAL_INFO.email}</li>
          <li>Nombre comercial: {LEGAL_INFO.siteName}</li>
        </ul>
      </LegalSection>

      <LegalSection heading="2. Objeto">
        <p>
          {LEGAL_INFO.siteName} es una tienda online que vende productos 100% digitales (guías,
          cursos y ebooks interactivos) de entrega inmediata tras el pago. No se venden productos
          físicos ni se realizan envíos postales.
        </p>
      </LegalSection>

      <LegalSection heading="3. Registro de cuenta">
        <p>
          Para comprar es necesario crear una cuenta con un email válido y una contraseña. Eres
          responsable de mantener la confidencialidad de tu contraseña y de toda actividad que
          ocurra desde tu cuenta. Si detectas un uso no autorizado, avísanos cuanto antes.
        </p>
        <p>
          El email se verifica mediante un código de un solo uso antes de poder iniciar sesión,
          para reducir el riesgo de cuentas creadas con direcciones que no te pertenecen.
        </p>
      </LegalSection>

      <LegalSection heading="4. Precios, moneda e impuestos">
        <p>
          Todos los precios se muestran en euros (€) e incluyen los impuestos aplicables. El
          precio final que pagas es el que se resuelve en nuestro servidor en el momento de la
          compra, no un precio que pueda enviarse desde el navegador, para que nadie pueda
          manipularlo.
        </p>
      </LegalSection>

      <LegalSection heading="5. Proceso de compra y pago">
        <p>
          Añades productos al carrito y confirmas la compra desde tu cuenta. El pago se procesa a
          través de Stripe, en una página segura alojada por el propio Stripe: los datos de tu
          tarjeta nunca pasan por nuestros servidores. Cuando Stripe confirma el pago, el pedido
          pasa a estado &ldquo;pagado&rdquo; y se entrega el producto (ver sección 6).
        </p>
        <p>
          Si el pago no llega a completarse, el pedido queda como pendiente o fallido y no se
          entrega ningún producto. Un pedido pagado forma parte de tu historial de compras y no se
          puede eliminar desde tu cuenta, precisamente para que siempre quede constancia de que el
          acceso fue entregado.
        </p>
      </LegalSection>

      <LegalSection heading="6. Entrega del producto y licencia de uso">
        <p>
          Al confirmarse el pago recibirás un email con el enlace de acceso al contenido digital
          comprado, de forma inmediata. Ese mismo enlace queda también disponible como respaldo en
          &ldquo;Mi cuenta&rdquo;, por si el email no llega o se pierde. Más detalles sobre la
          entrega en nuestra{" "}
          <Link href="/envios-pagos" className="underline hover:text-[var(--ink)]">
            página de Entrega y pagos
          </Link>
          .
        </p>
        <p>
          Salvo que la ficha del producto indique expresamente lo contrario (por ejemplo, una
          licencia de reventa o &ldquo;MRR&rdquo;), el acceso que compras es personal e
          intransferible: no está permitido revender, redistribuir ni compartir públicamente el
          contenido ni el enlace de acceso.
        </p>
      </LegalSection>

      <LegalSection heading="7. Derecho de desistimiento">
        <p>
          Como consumidor, tienes derecho a desistir de tu compra en un plazo de 14 días naturales
          sin necesidad de justificar tu decisión, conforme al Real Decreto Legislativo 1/2007
          (TRLGDCU).
        </p>
        <p>
          Este derecho tiene una excepción legal que se aplica a nuestros productos: al tratarse de
          contenido digital que no se suministra en un soporte material y cuya ejecución comienza
          de forma inmediata tras el pago (el acceso se entrega al instante), el derecho de
          desistimiento se pierde en el momento en que empieza la entrega, siempre que hayas dado tu
          consentimiento previo y expreso a esa entrega inmediata y hayas reconocido que, por ello,
          pierdes tu derecho de desistimiento (artículo 103.m del TRLGDCU). Si tienes cualquier
          incidencia con tu compra, escríbenos: siempre preferimos resolverlo hablando antes que
          amparándonos en esta excepción.
        </p>
      </LegalSection>

      <LegalSection heading="8. Propiedad intelectual">
        <p>
          El contenido de esta web (textos, diseño, logotipo, imágenes) y el de los productos
          digitales que vendemos están protegidos por derechos de propiedad intelectual. Salvo que
          se indique lo contrario en la ficha del producto (licencia de reventa), su uso se limita
          al personal del comprador.
        </p>
      </LegalSection>

      <LegalSection heading="9. Responsabilidad">
        <p>
          Hacemos lo posible por mantener la web disponible y funcionando correctamente, pero no
          garantizamos que esté libre de interrupciones o errores en todo momento. No nos hacemos
          responsables de daños derivados de un uso indebido de la web o de causas ajenas a nuestro
          control (por ejemplo, fallos de terceros como la pasarela de pago o el proveedor de
          email).
        </p>
      </LegalSection>

      <LegalSection heading="10. Modificaciones">
        <p>
          Podemos actualizar estos términos cuando sea necesario, por ejemplo para reflejar cambios
          legales o en el funcionamiento de la tienda. La fecha de &ldquo;última actualización&rdquo;
          al principio de esta página siempre indica la versión vigente.
        </p>
      </LegalSection>

      <LegalSection heading="11. Legislación aplicable y resolución de conflictos">
        <p>
          Estos términos se rigen por la legislación española. Para cualquier controversia, y sin
          perjuicio del fuero que pudiera corresponder por ley al consumidor, las partes se someten
          a los juzgados y tribunales que correspondan según la normativa de protección de
          consumidores.
        </p>
        <p>
          La Comisión Europea pone a tu disposición una plataforma de resolución de litigios en
          línea, accesible en{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[var(--ink)]"
          >
            ec.europa.eu/consumers/odr
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="12. Contacto">
        <p>
          Para cualquier duda sobre estos términos, puedes escribirnos a {LEGAL_INFO.email} o desde
          nuestra{" "}
          <Link href="/contacto" className="underline hover:text-[var(--ink)]">
            página de contacto
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
