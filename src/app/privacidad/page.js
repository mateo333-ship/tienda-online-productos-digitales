import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal-page";
import { LEGAL_INFO } from "@/lib/legal-info";

export const metadata = {
  title: "Política de privacidad",
  description: "Cómo tratamos tus datos personales en The God Supplier.",
};

const UPDATED = "22 de septiembre de 2026";

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      updated={UPDATED}
      intro="Aquí explicamos qué datos personales tratamos, para qué los usamos y qué derechos tienes sobre ellos, conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPD-GDD)."
    >
      <LegalSection heading="1. Responsable del tratamiento">
        <ul className="list-disc space-y-1 pl-5">
          <li>Responsable: {LEGAL_INFO.ownerName}</li>
          <li>NIF/CIF: {LEGAL_INFO.taxId}</li>
          <li>Domicilio: {LEGAL_INFO.address}</li>
          <li>Email de contacto para temas de privacidad: {LEGAL_INFO.email}</li>
        </ul>
      </LegalSection>

      <LegalSection heading="2. Qué datos tratamos">
        <p>Solo tratamos los datos necesarios para que la tienda funcione:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Datos de cuenta: nombre y email que indicas al registrarte.</li>
          <li>Contraseña: nunca se guarda en texto plano, solo un hash seguro (bcrypt) que no permite recuperarla.</li>
          <li>Datos de pedidos: productos comprados, precio, fecha y estado del pago.</li>
          <li>
            Datos de pago: los introduces directamente en la página segura de Stripe; nosotros no
            llegamos a ver ni a guardar el número de tu tarjeta.
          </li>
          <li>Mensajes que nos envías desde el formulario de contacto (nombre, email y el mensaje en sí).</li>
          <li>Datos técnicos básicos (por ejemplo, dirección IP) usados para seguridad y para limitar abusos, como los intentos de inicio de sesión.</li>
          <li>
            Cookies y tecnologías similares — ver el detalle completo en nuestra{" "}
            <Link href="/cookies" className="underline hover:text-[var(--ink)]">
              Política de cookies
            </Link>
            .
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Para qué usamos tus datos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Crear y gestionar tu cuenta, y mantener tu sesión iniciada.</li>
          <li>Procesar tus pedidos y pagos, y entregarte el producto digital comprado por email.</li>
          <li>Responder a los mensajes que nos envías desde el formulario de contacto.</li>
          <li>Prevenir fraude y proteger la seguridad de la tienda (por ejemplo, limitar intentos de inicio de sesión).</li>
          <li>Cumplir con nuestras obligaciones legales y fiscales.</li>
        </ul>
        <p>No usamos tus datos para fines distintos de los anteriores, ni los vendemos a terceros.</p>
      </LegalSection>

      <LegalSection heading="4. Base legal">
        <ul className="list-disc space-y-1 pl-5">
          <li>Ejecución de un contrato: gestionar tu cuenta, tus pedidos y la entrega de lo que compras.</li>
          <li>Consentimiento: para las cookies no esenciales (analíticas o de marketing) y para el formulario de contacto.</li>
          <li>Interés legítimo: prevención de fraude y seguridad de la tienda.</li>
          <li>Obligación legal: conservación de facturas y registros contables cuando corresponda.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Con quién compartimos tus datos">
        <p>
          No vendemos tus datos. Los compartimos únicamente con los proveedores estrictamente
          necesarios para que la tienda funcione, que actúan como encargados del tratamiento bajo
          contrato:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-[var(--ink)]">Stripe</strong> — procesa el pago de tus pedidos.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Proveedor de email transaccional</strong> — envía
            el correo de verificación de cuenta y el de entrega de tu compra.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Proveedor de infraestructura y base de datos</strong>{" "}
            — aloja de forma segura los datos de cuentas y pedidos.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Proveedor de alojamiento web (hosting)</strong> —
            sirve la propia página que estás viendo.
          </li>
        </ul>
        <p>
          Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En
          ese caso, se apoyan en garantías reconocidas por el RGPD, como las cláusulas
          contractuales tipo de la Comisión Europea.
        </p>
      </LegalSection>

      <LegalSection heading="6. Cuánto tiempo conservamos tus datos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Datos de cuenta: mientras mantengas la cuenta activa. Puedes pedirnos que la eliminemos en cualquier momento.</li>
          <li>
            Datos de pedidos pagados: se conservan aunque elimines la cuenta, ya que las
            obligaciones fiscales y contables en España exigen conservar esta información
            (habitualmente hasta 6 años).
          </li>
          <li>Mensajes de contacto: el tiempo necesario para atender tu consulta.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="7. Tus derechos">
        <p>
          Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión,
          oposición, limitación del tratamiento y portabilidad de tus datos, escribiendo a{" "}
          {LEGAL_INFO.email}. También tienes derecho a retirar tu consentimiento cuando el
          tratamiento se base en él (por ejemplo, las cookies no esenciales, desde el botón de
          preferencias de cookies) y a presentar una reclamación ante la Agencia Española de
          Protección de Datos (
          <a
            href="https://www.aepd.es"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[var(--ink)]"
          >
            aepd.es
          </a>
          ) si consideras que no hemos tratado tus datos correctamente.
        </p>
      </LegalSection>

      <LegalSection heading="8. Seguridad">
        <p>
          Aplicamos medidas técnicas razonables para proteger tus datos: la conexión a esta web va
          siempre cifrada (HTTPS), las contraseñas se guardan mediante un hash seguro que no puede
          revertirse, y la sesión de tu cuenta viaja en una cookie cifrada que ni el navegador ni un
          posible intermediario pueden leer. Aun así, ningún sistema es 100% infalible; si detectas
          alguna vulnerabilidad, agradecemos que nos la reportes a {LEGAL_INFO.email}.
        </p>
      </LegalSection>

      <LegalSection heading="9. Cambios en esta política">
        <p>
          Podemos actualizar esta política cuando sea necesario. La fecha de &ldquo;última
          actualización&rdquo; al principio de esta página siempre indica la versión vigente.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
