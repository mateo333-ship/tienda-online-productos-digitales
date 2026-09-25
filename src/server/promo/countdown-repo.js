import "server-only";

import { updateJsonStore } from "../data/store.js";

const COUNTDOWN_FILE = "launch-countdown.json";

// Duración total de la oferta de lanzamiento: 8 días completos desde el
// momento en que este contador se crea por primera vez (la primera vez
// que alguien visita la web después de desplegar esto). A partir de ahí,
// esa fecha límite queda GUARDADA — en Firebase en producción, o en un
// fichero local en desarrollo, ver server/data/store.js — y ya no
// cambia: no se reinicia ni al recargar la página ni al volver a
// desplegar la web con otro cambio cualquiera.
const DURATION_MS = 8 * 24 * 60 * 60 * 1000;

// Lo que anuncia el contador. OJO: esto es solo el TEXTO que se enseña.
// El descuento de verdad lo sigue aplicando Stripe, con este mismo
// código de promoción (ver /api/checkout, `allow_promotion_codes:
// true`). Para que el código deje de funcionar DE VERDAD en el momento
// en que el contador llegue a cero, hay que ponerle a ese código una
// fecha de caducidad en el panel de Stripe que coincida con `endsAt`
// (Stripe → Pagos → Códigos promocionales → DIGITAL10 → fecha límite de
// canje) — este fichero no puede hacerlo por sí solo, porque Stripe
// decide la validez del código de forma independiente a esta web.
const OFFER = { code: "DIGITAL10", percent: 10 };

/**
 * Devuelve la cuenta atrás de lanzamiento, creándola la primera vez que
 * se pide (con `startedAt` = ahora mismo) y devolviendo siempre la
 * MISMA a partir de ahí, la pida quien la pida. Usa `updateJsonStore`
 * (lectura + escritura atómica, ver server/data/store.js) para que, si
 * dos visitas llegasen justo a la vez en el primerísimo momento, no se
 * creasen por error dos fechas de fin ligeramente distintas.
 */
export async function getLaunchCountdown() {
  const { record } = await updateJsonStore(COUNTDOWN_FILE, null, (current) => {
    if (current?.endsAt) return { next: undefined, record: current };
    const startedAt = Date.now();
    const created = { startedAt, endsAt: startedAt + DURATION_MS, ...OFFER };
    return { next: created, record: created };
  });
  return record;
}
