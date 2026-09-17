import "server-only";

import { randomUUID } from "node:crypto";
import { readJsonStore, writeJsonStore } from "../data/store.js";

/**
 * ------------------------------------------------------------------
 *  ⚠️  ALMACENAMIENTO TEMPORAL — sustituir por una base de datos real
 * ------------------------------------------------------------------
 * Ahora mismo los usuarios se guardan en `src/server/data/users.json`
 * y los registros pendientes de verificar en
 * `src/server/data/pending-registrations.json`.
 *
 * Cuando conectéis una base de datos (Postgres, MySQL, Supabase...),
 * este es el ÚNICO fichero que hay que reescribir: cambiar cada función
 * de aquí por su equivalente en SQL, manteniendo la misma "forma" de
 * entrada/salida. Ningún otro fichero del proyecto necesita cambiar,
 * porque las rutas de la API solo hablan con estas funciones.
 * ------------------------------------------------------------------
 */

const USERS_FILE = "users.json";
const PENDING_FILE = "pending-registrations.json";
const OTP_MAX_ATTEMPTS = 5;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutos

export async function findUserByEmail(email) {
  const users = await readJsonStore(USERS_FILE, []);
  return users.find((u) => u.email === email.toLowerCase()) ?? null;
}

export async function findUserById(id) {
  const users = await readJsonStore(USERS_FILE, []);
  return users.find((u) => u.id === id) ?? null;
}

export async function findPendingByEmail(email) {
  const pending = await readJsonStore(PENDING_FILE, []);
  return pending.find((p) => p.email === email.toLowerCase()) ?? null;
}

/**
 * Crea (o reemplaza) un registro pendiente de verificación por email.
 * Todavía no es un usuario "real": no puede iniciar sesión hasta que
 * confirme el código OTP.
 */
export async function createPendingRegistration({ email, name, passwordHash, otpHash }) {
  const pending = await readJsonStore(PENDING_FILE, []);
  const normalizedEmail = email.toLowerCase();
  const filtered = pending.filter((p) => p.email !== normalizedEmail);

  const record = {
    email: normalizedEmail,
    name,
    passwordHash,
    otpHash,
    otpAttempts: 0,
    otpExpiresAt: Date.now() + OTP_TTL_MS,
    createdAt: Date.now(),
  };

  filtered.push(record);
  await writeJsonStore(PENDING_FILE, filtered);
  return record;
}

export async function registerOtpAttempt(email) {
  const pending = await readJsonStore(PENDING_FILE, []);
  const normalizedEmail = email.toLowerCase();
  const record = pending.find((p) => p.email === normalizedEmail);
  if (!record) return null;
  record.otpAttempts += 1;
  await writeJsonStore(PENDING_FILE, pending);
  return record;
}

export function isOtpExpired(record) {
  return !record || Date.now() > record.otpExpiresAt;
}

export function hasTooManyOtpAttempts(record) {
  return !record || record.otpAttempts >= OTP_MAX_ATTEMPTS;
}

/**
 * Confirma el registro: mueve el registro pendiente a la tabla de
 * usuarios "de verdad" y lo borra de pendientes.
 */
export async function activatePendingRegistration(email) {
  const normalizedEmail = email.toLowerCase();
  const pending = await readJsonStore(PENDING_FILE, []);
  const record = pending.find((p) => p.email === normalizedEmail);
  if (!record) return null;

  const users = await readJsonStore(USERS_FILE, []);
  const newUser = {
    id: randomUUID(),
    email: record.email,
    name: record.name,
    passwordHash: record.passwordHash,
    createdAt: Date.now(),
  };
  users.push(newUser);

  await writeJsonStore(USERS_FILE, users);
  await writeJsonStore(
    PENDING_FILE,
    pending.filter((p) => p.email !== normalizedEmail)
  );

  return newUser;
}

export function publicUser(user) {
  if (!user) return null;
  // Nunca devolvemos passwordHash (ni ningún otro dato sensible) al cliente.
  const { id, email, name, createdAt } = user;
  return { id, email, name, createdAt };
}
