import "server-only";

/**
 * ------------------------------------------------------------------
 *  ⚠️  NO HAY PROVEEDOR DE EMAIL CONECTADO TODAVÍA
 * ------------------------------------------------------------------
 * Ahora mismo esta función solo escribe el código en la consola del
 * servidor (nunca en el navegador del cliente, salvo en modo demo, ver
 * abajo). Antes de vender de verdad, conecta un proveedor real:
 *
 *   - Resend (resend.com) — el más simple de integrar con Next.js
 *   - Postmark, SendGrid, Amazon SES...
 *
 * Normalmente es tan sencillo como sustituir el `console.log` de aquí
 * abajo por una llamada a la API del proveedor elegido, usando una
 * API key guardada en variables de entorno (nunca en el código).
 * ------------------------------------------------------------------
 */
export async function sendVerificationEmail(email, code) {
  console.log(`[MAIL DEMO] Código de verificación para ${email}: ${code}`);
  // await resend.emails.send({ to: email, subject: "Tu código de verificación", ... })
}
