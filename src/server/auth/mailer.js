import "server-only";

import { LEGAL_INFO } from "@/lib/legal-info";

/**
 * ------------------------------------------------------------------
 *  Envío de emails (verificación de cuenta y entrega de compras)
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
 * sea, el contenido se escribe en la consola del servidor como red de
 * seguridad ("modo demo"): un fallo del proveedor de email nunca debe
 * tirar abajo el registro de una cuenta ni la confirmación de un pago.
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

// Dirección a la que llegan las respuestas de un cliente que conteste al
// email (por ejemplo, "no me ha llegado el acceso"). Sin esto, la
// respuesta viaja al remitente tal cual (`BREVO_FROM_EMAIL` o el
// `onboarding@resend.dev` de Resend, que no es una bandeja de nadie) y
// se pierde para siempre. Solo se usa si `LEGAL_INFO.email` ya se ha
// rellenado con una dirección real (ver src/lib/legal-info.js) — con el
// valor de ejemplo entre corchetes, ni Brevo ni Resend lo aceptarían
// como email válido, así que en ese caso simplemente no se manda.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REPLY_TO = EMAIL_REGEX.test(LEGAL_INFO.email) ? LEGAL_INFO.email : null;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

async function sendWithBrevo({ to, subject, html, text }) {
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
      to: [{ email: to }],
      subject,
      htmlContent: html,
      // Una versión en texto plano, además del HTML: sin ella, Gmail y
      // otros webmails tratan el correo como si fuera puramente
      // publicitario (ninguna newsletter manda solo texto plano) y es
      // uno de los motivos más comunes por los que un email totalmente
      // legítimo cae en la pestaña de Promociones o en spam.
      textContent: text,
      ...(REPLY_TO ? { replyTo: { email: REPLY_TO } } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`No se ha podido enviar el email por Brevo (HTTP ${res.status}). ${detail}`);
  }
}

async function sendWithResend({ to, subject, html, text }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [to],
      subject,
      html,
      text,
      ...(REPLY_TO ? { reply_to: REPLY_TO } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`No se ha podido enviar el email por Resend (HTTP ${res.status}). ${detail}`);
  }
}

/** Envío genérico: intenta Brevo, si no Resend, y si ninguno está
 * configurado (o el envío real falla) deja constancia en los Logs como
 * red de seguridad, mediante `fallbackLog`. */
async function sendEmail({ to, subject, html, text, fallbackLog }) {
  if (BREVO_API_KEY) {
    try {
      await sendWithBrevo({ to, subject, html, text });
      return;
    } catch (err) {
      console.error("[MAIL] No se ha podido enviar por Brevo, sigo en modo demo:", err.message);
    }
  } else if (RESEND_API_KEY) {
    try {
      await sendWithResend({ to, subject, html, text });
      return;
    } catch (err) {
      console.error("[MAIL] No se ha podido enviar por Resend, sigo en modo demo:", err.message);
    }
  }

  console.log(fallbackLog);
}

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

function verificationEmailText(code) {
  return `Verifica tu email\n\nTu código de verificación es: ${code}\n\nCaduca en 10 minutos. Si no has sido tú, ignora este mensaje.`;
}

export async function sendVerificationEmail(email, code) {
  await sendEmail({
    to: email,
    subject: "Tu código de verificación",
    html: verificationEmailHtml(code),
    text: verificationEmailText(code),
    fallbackLog: `[MAIL DEMO] Código de verificación para ${email}: ${code}`,
  });
}

/**
 * Email de entrega tras un pago confirmado: uno por pedido, con un
 * bloque por CADA producto comprado (así, si alguien compra dos guías
 * distintas, recibe un único email pero con dos accesos claramente
 * separados, cada uno con su propio enlace). Si un producto todavía no
 * tiene enlace de acceso configurado (`accessUrl` en el catálogo), se
 * avisa de que se le contactará a mano en su lugar, en vez de dejar el
 * hueco en blanco.
 */
function orderDeliveryEmailHtml({ toName, items }) {
  const blocks = items
    .map((item) => {
      if (item.accessUrl) {
        return `
          <div style="margin:16px 0;padding:16px 20px;border:1px solid #e5e5e5;border-radius:12px;">
            <p style="margin:0 0 12px;font-weight:600;">${escapeHtml(item.name)}</p>
            <a href="${escapeHtml(item.accessUrl)}"
               style="display:inline-block;padding:10px 18px;background:#111827;color:#fff;border-radius:8px;text-decoration:none;font-weight:500;">
              Acceder ahora
            </a>
          </div>`;
      }
      return `
        <div style="margin:16px 0;padding:16px 20px;border:1px solid #e5e5e5;border-radius:12px;">
          <p style="margin:0;font-weight:600;">${escapeHtml(item.name)}</p>
          <p style="margin:8px 0 0;color:#666;font-size:14px;">
            Estamos preparando tu acceso a este producto y te contactaremos en breve.
          </p>
        </div>`;
    })
    .join("");

  return `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
      <h2 style="margin-bottom: 8px;">¡Gracias por tu compra${toName ? `, ${escapeHtml(toName)}` : ""}!</h2>
      <p>Aquí tienes el acceso a lo que has comprado:</p>
      ${blocks}
      <p style="color:#666;font-size:13px;">
        Si tienes cualquier problema para acceder, responde a este email y te ayudamos.
      </p>
    </div>
  `;
}

function orderDeliveryEmailText({ toName, items }) {
  const lines = items.map((item) =>
    item.accessUrl
      ? `- ${item.name}\n  Acceder: ${item.accessUrl}`
      : `- ${item.name}\n  Estamos preparando tu acceso a este producto y te contactaremos en breve.`
  );
  return [
    `¡Gracias por tu compra${toName ? `, ${toName}` : ""}!`,
    "",
    "Aquí tienes el acceso a lo que has comprado:",
    "",
    ...lines,
    "",
    "Si tienes cualquier problema para acceder, responde a este email y te ayudamos.",
  ].join("\n");
}

export async function sendOrderDeliveryEmail({ toEmail, toName, items }) {
  const itemNames = items.map((i) => i.name).join(", ");
  await sendEmail({
    to: toEmail,
    subject: "Tu acceso a la compra en The God Supplier",
    html: orderDeliveryEmailHtml({ toName, items }),
    text: orderDeliveryEmailText({ toName, items }),
    fallbackLog: `[MAIL DEMO] Email de entrega para ${toEmail} (${toName || "sin nombre"}): ${itemNames}`,
  });
}
