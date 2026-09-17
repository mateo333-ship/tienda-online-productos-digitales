import "server-only";

/**
 * ------------------------------------------------------------------
 *  Envío del código de verificación por email
 * ------------------------------------------------------------------
 * Usa Resend (resend.com) a través de su API REST, sin depender de
 * ningún paquete adicional (igual que hacemos con Firebase): solo hace
 * falta una API key.
 *
 * Detección automática, igual que con la base de datos:
 *   - Si existe RESEND_API_KEY: se envía un email real con el código.
 *   - Si no existe (normalmente en tu ordenador, en desarrollo): el
 *     código se escribe en la consola del servidor y además se
 *     devuelve en pantalla ("modo demo"), como hasta ahora.
 *
 * Cómo conseguir la API key: ver README.md, sección "Enviar los
 * códigos de verificación por email de verdad (Resend)".
 * ------------------------------------------------------------------
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Mientras no verifiques tu propio dominio en Resend, solo puedes enviar
// emails con esta dirección de remitente, y solo a la dirección de email
// con la que creaste tu cuenta de Resend. En cuanto verifiques un dominio
// propio (Resend te lo guía paso a paso), cambia FROM_EMAIL por algo como
// "Terra Casa <codigos@tudominio.com>" mediante la variable RESEND_FROM_EMAIL.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Terra Casa <onboarding@resend.dev>";

async function sendWithResend(email, code) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: "Tu código de verificación",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="margin-bottom: 8px;">Verifica tu email</h2>
          <p>Tu código de verificación es:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p>
          <p style="color: #666; font-size: 14px;">Caduca en 10 minutos. Si no has sido tú, ignora este mensaje.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`No se ha podido enviar el email de verificación (HTTP ${res.status}). ${detail}`);
  }
}

export async function sendVerificationEmail(email, code) {
  if (RESEND_API_KEY) {
    await sendWithResend(email, code);
    return;
  }

  // Modo demo: sin API key, seguimos como hasta ahora para no romper el
  // desarrollo local.
  console.log(`[MAIL DEMO] Código de verificación para ${email}: ${code}`);
}
