import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * ------------------------------------------------------------------
 *  ⚠️  Por qué existe este fichero con dos "modos"
 * ------------------------------------------------------------------
 * En tu ordenador (npm run dev / npm run build && npm run start), el
 * disco es tuyo y persiste: guardar los datos en ficheros JSON dentro
 * de `src/server/data/` funciona perfectamente.
 *
 * Pero en Vercel (y en cualquier hosting "serverless") el disco donde
 * se ejecuta tu código es de solo lectura, así que hay que guardar los
 * datos en algo que viva fuera de la propia función: aquí usamos
 * **Firebase Realtime Database**, a través de su API REST y el
 * "secreto de la base de datos" (Database secret) — no hace falta el
 * SDK de administrador ni una cuenta de servicio, así que esto funciona
 * aunque las políticas de tu organización de Google bloqueen la
 * creación de claves de cuentas de servicio (un bloqueo cada vez más
 * habitual por defecto). Instrucciones completas en el README
 * principal, sección "Poner la tienda en producción (Vercel)".
 *
 * Este fichero detecta solo si existen las variables de entorno de
 * Firebase:
 *   - Si existen (típicamente en producción, en Vercel): usa Firebase.
 *   - Si no existen (normalmente en tu ordenador): sigue usando
 *     ficheros JSON locales, como hasta ahora, para que `npm run dev`
 *     funcione sin tener que configurar nada.
 *
 * El resto del proyecto (users-repo.js, orders-repo.js, etc.) no sabe
 * ni le importa cuál de los dos modos está activo: siempre llama a
 * `readJsonStore` / `writeJsonStore`.
 * ------------------------------------------------------------------
 */

const databaseURL = process.env.FIREBASE_DATABASE_URL?.replace(/\/$/, "");
const databaseSecret = process.env.FIREBASE_DATABASE_SECRET;

const useFirebase = Boolean(databaseURL && databaseSecret);

export function isUsingFirebase() {
  return useFirebase;
}

// ---------------------------------------------------------------------
// Modo Firebase Realtime Database (producción / Vercel), vía REST
// ---------------------------------------------------------------------
function firebaseUrl(fileName) {
  // Los nombres de ruta de Realtime Database no pueden contener ".",
  // así que quitamos la extensión ".json" del nombre lógico y añadimos
  // la ".json" que exige la propia API REST al final de la URL.
  const node = fileName.replace(/\.json$/, "");
  return `${databaseURL}/tienda/${node}.json?auth=${databaseSecret}`;
}

async function readFromFirebase(fileName, defaultValue) {
  const res = await fetch(firebaseUrl(fileName), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`No se ha podido leer "${fileName}" de Firebase (HTTP ${res.status}).`);
  }
  const value = await res.json();
  return value ?? defaultValue;
}

async function writeToFirebase(fileName, data) {
  const res = await fetch(firebaseUrl(fileName), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`No se ha podido guardar "${fileName}" en Firebase (HTTP ${res.status}).`);
  }
}

// ---------------------------------------------------------------------
// Modo fichero local (desarrollo)
// ---------------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), "src", "server", "data");

async function ensureFile(fileName, defaultValue) {
  const filePath = path.join(DATA_DIR, fileName);
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(filePath, "utf-8");
  } catch {
    await writeFile(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
  }
  return filePath;
}

// Un mutex por fichero muy simple para evitar condiciones de carrera si
// llegan dos escrituras casi a la vez (dos registros al mismo tiempo, etc.).
// Firebase no lo necesita: cada escritura ya es atómica en su propia ruta.
const locks = new Map();
async function withLock(fileName, fn) {
  const previous = locks.get(fileName) ?? Promise.resolve();
  let release;
  const current = new Promise((resolve) => (release = resolve));
  locks.set(fileName, previous.then(() => current));
  await previous;
  try {
    return await fn();
  } finally {
    release();
  }
}

async function readFromFile(fileName, defaultValue) {
  const filePath = await ensureFile(fileName, defaultValue);
  const raw = await readFile(filePath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

async function writeToFile(fileName, data) {
  return withLock(fileName, async () => {
    const filePath = await ensureFile(fileName, data);
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  });
}

// ---------------------------------------------------------------------
// API pública (igual que antes: el resto del proyecto no cambia nada)
// ---------------------------------------------------------------------
export async function readJsonStore(fileName, defaultValue) {
  return useFirebase ? readFromFirebase(fileName, defaultValue) : readFromFile(fileName, defaultValue);
}

export async function writeJsonStore(fileName, data) {
  return useFirebase ? writeToFirebase(fileName, data) : writeToFile(fileName, data);
}
