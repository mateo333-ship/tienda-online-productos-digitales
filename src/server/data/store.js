import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Todos los "ficheros de base de datos" viven fuera de `public/` y fuera de
// `src/app`, así que Next.js nunca los sirve como archivos estáticos: no
// hay ninguna URL que permita descargarlos directamente.
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

export async function readJsonStore(fileName, defaultValue) {
  const filePath = await ensureFile(fileName, defaultValue);
  const raw = await readFile(filePath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export async function writeJsonStore(fileName, data) {
  return withLock(fileName, async () => {
    const filePath = await ensureFile(fileName, data);
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  });
}
