import "server-only";

/**
 * Limitador de intentos muy sencillo, en memoria.
 *
 * ⚠️ Esto reduce ataques de fuerza bruta oportunistas, pero:
 *  - Se reinicia si el servidor se reinicia.
 *  - No funciona si despliegas varias instancias del servidor a la vez.
 * Para producción seria, sustituye esto por algo compartido (Redis, la
 * base de datos, o un servicio como Upstash Ratelimit).
 */

const attempts = new Map();

export function checkRateLimit(key, { max = 8, windowMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.start > windowMs) {
    attempts.set(key, { start: now, count: 1 });
    return { allowed: true, remaining: max - 1 };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, retryAfterMs: windowMs - (now - entry.start) };
  }

  entry.count += 1;
  return { allowed: true, remaining: max - entry.count };
}

// Limpieza periódica para no acumular memoria indefinidamente.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (now - entry.start > 60 * 60 * 1000) attempts.delete(key);
  }
}, 30 * 60 * 1000).unref?.();
