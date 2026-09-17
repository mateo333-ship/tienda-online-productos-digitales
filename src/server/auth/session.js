import "server-only";

import { EncryptJWT, jwtDecrypt } from "jose";
import { createHash } from "node:crypto";

const COOKIE_NAME = "tienda_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 días

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "Falta SESSION_SECRET (o es demasiado corto) en las variables de entorno. " +
        "Revisa .env.local — nunca despliegues esta web sin cambiar este valor por uno propio."
    );
  }
  // Derivamos una clave de 256 bits a partir del secreto de entorno.
  return createHash("sha256").update(secret).digest();
}

/**
 * Crea el valor de la cookie de sesión. A diferencia de un JWT normal
 * (que solo va firmado y cualquiera puede leer su contenido, aunque no
 * pueda modificarlo), aquí usamos JWE: el contenido va **cifrado** con
 * AES-256-GCM. Ni el navegador ni un posible intermediario pueden leer
 * qué usuario hay dentro, y además no se puede falsificar ni modificar.
 */
export async function createSessionToken(userId) {
  const key = getSecretKey();
  return new EncryptJWT({ sub: userId })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .encrypt(key);
}

/** Descifra y valida el token de sesión. Devuelve el userId o null. */
export async function readSessionToken(token) {
  if (!token) return null;
  try {
    const key = getSecretKey();
    const { payload } = await jwtDecrypt(token, key);
    return payload.sub ?? null;
  } catch {
    // Token ausente, caducado, manipulado o firmado con otra clave.
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE = SESSION_DURATION_SECONDS;

export function sessionCookieOptions() {
  return {
    httpOnly: true, // el JavaScript de la página no puede leer esta cookie
    secure: process.env.NODE_ENV === "production", // solo por HTTPS en producción
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}
