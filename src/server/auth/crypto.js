import "server-only";

import bcrypt from "bcryptjs";
import { createHash, randomInt } from "node:crypto";

const BCRYPT_COST = 12;

/** Hashea una contraseña. Nunca se guarda en texto plano. */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, BCRYPT_COST);
}

/** Compara una contraseña en claro contra su hash guardado. */
export async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

/** Genera un código de un solo uso de 6 dígitos (para el email de verificación). */
export function generateOtpCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Los códigos OTP también se hashean antes de guardarlos: son de corta
 * duración, pero si alguien accediera a los datos guardados, no debería
 * poder ver códigos válidos.
 */
export function hashOtpCode(code) {
  return createHash("sha256").update(code).digest("hex");
}

export function verifyOtpCode(code, codeHash) {
  return hashOtpCode(code) === codeHash;
}
