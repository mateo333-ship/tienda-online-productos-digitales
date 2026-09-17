import "server-only";

/**
 * ------------------------------------------------------------------
 *  Envío del código de verificación por email
 * ------------------------------------------------------------------
 * Dos proveedores posibles, elegidos automáticamente según qué
 * variables de entorno existan (ninguno necesita un paquete adicional,
 * ambos hablan por su API REST con `fetch`):
 *
 *   1. Brevo (BREVO_API_KEY) — RECOMENDADO si no tienes un dominio
 *      propio: deja enviar a cualquier destinatario verificando solo
 *      una dirección de email como remitente (no un dominio entero).
 *      300 emails/día gratis.
 *   2. Resend (RESEND_API_KEY) — mejor entrega si en el futuro
 *      verificas un dominio propio, pero mientras no lo hagas solo
 *      puede enviar a la dirección con la que creaste la cuenta.
 *
 * Si no hay ninguna de las dos, o si el envío real falla por lo que
 * sea, el código se escribe en la consola del servidor como red de
 * seguridad ("modo demo"), y nunca se deja caer todo el registro por
 * un fallo del proveedor de email.
 *
 * Cómo conseguir las claves: ver README.md, sección "Enviar los
 * códigos de verificación por email de verdad".
 * ------------------------------------------------------------------
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL;
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME || "The God Supplier";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "The God Supplier <onboarding@resend.dev>";

function verificationEmailHtml(code) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="margin-bottom: 8px;">Verifica tu email</h2>
      <p>Tu código de verificación es:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p>
      <p style="color: #666; font-size: 14px;">Caduca en 10 minutos. Si no has sido tú, ignora este mensaje.</p>
    </div>
  `;
}

async function sendWithBrevo(email, code) {
  if (!BREVO_FROM_EMAIL) {
    throw new Error(
      "Falta BREVO_FROM_EMAIL: pon aquí la dirección que verificaste como remitente en Brevo."
    );
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: BREVO_FROM_NAME, email: BREVO_FROM_EMAIL },
      to: [{ email }],
      subject: "Tu código de verificación",
      htmlContent: verificationEmailHtml(code),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`No se ha podido enviar el email por Brevo (HTTP ${res.status}). ${detail}`);
  }
}

async function sendWithResend(email, code) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [email],
      subject: "Tu código de verificación",
      html: verificationEmailHtml(code),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`No se ha podido enviar el email por Resend (HTTP ${res.status}). ${detail}`);
  }
}

export async function sendVerificationEmail(email, code) {
  // Un fallo del proveedor de email (clave inválida, límite alcanzado,
  // restricción de destinatario...) NUNCA debe impedir que la cuenta se
  // cree. Si el envío real falla, lo dejamos escrito en los Logs junto
  // con el código, como red de seguridad, y seguimos.
  if (BREVO_API_KEY) {
    try {
      await sendWithBrevo(email, code);
      return;
    } catch (err) {
      console.error("[MAIL] No se ha podido enviar por Brevo, sigo en modo demo:", err.message);
    }
  } else if (RESEND_API_KEY) {
    try {
      await sendWithResend(email, code);
      return;
    } catch (err) {
      console.error("[MAIL] No se ha podido enviar por Resend, sigo en modo demo:", err.message);
    }
  }

  // Modo demo: sin ninguna clave configurada, o si el envío real ha
  // fallado, el código queda aquí como red de seguridad.
  console.log(`[MAIL DEMO] Código de verificación para ${email}: ${code}`);
}
