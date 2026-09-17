import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";

/**
 * ------------------------------------------------------------------
 *  ⚠️  Por qué existe este fichero con dos "modos"
 * ------------------------------------------------------------------
 * En tu ordenador (npm run dev / npm run build && npm run start), el
 * disco es tuyo y persiste: guardar los datos en ficheros JSON dentro
 * de `src/server/data/` funciona perfectamente.
 *
 * Pero en Vercel (y en cualquier hosting "serverless") el disco donde
 * se ejecuta tu código es de solo lectura, excepto una carpeta temporal
 * que además se borra en cualquier momento y no se comparte entre las
 * distintas copias de tu función que Vercel arranca para atender
 * peticiones a la vez. Por eso, al desplegar allí, cualquier intento de
 * escribir un fichero (por ejemplo, al registrarte) fallaba con un
 * error 500 que el navegador no podía interpretar como JSON — el error
 * exacto que viste.
 *
 * La solución real (no un parche) es guardar los datos en algo que
 * viva fuera de la propia función: aquí usamos Redis a través de
 * Upstash, que tiene un plan gratuito y se integra con un clic desde
 * el propio panel de Vercel (Storage → Create Database). Instrucciones
 * completas en el README principal, sección "Poner la tienda en
 * producción (Vercel)".
 *
 * Este fichero detecta solo si esas variables de entorno existen:
 *   - Si existen (típicamente en producción, en Vercel): usa Redis.
 *   - Si no existen (normalmente en tu ordenador): sigue usando
 *     ficheros JSON locales, como hasta ahora, para que `npm run dev`
 *     funcione sin tener que configurar nada.
 *
 * El resto del proyecto (users-repo.js, orders-repo.js, etc.) no sabe
 * ni le importa cuál de los dos modos está activo: siempre llama a
 * `readJsonStore` / `writeJsonStore`.
 * ------------------------------------------------------------------
 */

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(redisUrl && redisToken);

const redis = useRedis ? new Redis({ url: redisUrl, token: redisToken }) : null;

export function isUsingRedis() {
  return useRedis;
}

// ---------------------------------------------------------------------
// Modo Redis (producción / Vercel)
// ---------------------------------------------------------------------
function redisKey(fileName) {
  // Un espacio de nombres propio para no chocar con otros datos que
  // guardes en la misma base de datos Redis en el futuro.
  return `tienda:${fileName}`;
}

async function readFromRedis(fileName, defaultValue) {
  const value = await redis.get(redisKey(fileName));
  return value ?? defaultValue;
}

async function writeToRedis(fileName, data) {
  await redis.set(redisKey(fileName), data);
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
// Redis no lo necesita: cada SET ya es atómico.
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
  return useRedis ? readFromRedis(fileName, defaultValue) : readFromFile(fileName, defaultValue);
}

export async function writeJsonStore(fileName, data) {
  return useRedis ? writeToRedis(fileName, data) : writeToFile(fileName, data);
}
