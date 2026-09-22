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

/**
 * Igual que `readFromFirebase`, pero además pide a Firebase una "ETag":
 * una especie de sello que identifica exactamente esa versión de los
 * datos, para poder comprobar más tarde si alguien más ha escrito por
 * en medio (ver `updateFirebase` más abajo).
 */
async function readFirebaseWithTag(fileName, defaultValue) {
  const res = await fetch(firebaseUrl(fileName), {
    cache: "no-store",
    headers: { "X-Firebase-ETag": "true" },
  });
  if (!res.ok) {
    throw new Error(`No se ha podido leer "${fileName}" de Firebase (HTTP ${res.status}).`);
  }
  const etag = res.headers.get("etag");
  const value = await res.json();
  return { value: value ?? defaultValue, etag };
}

/**
 * Escritura "condicional": Firebase solo la acepta si nadie ha vuelto a
 * escribir ese mismo dato desde que se leyó la ETag (con `if-match`).
 * Si alguien se ha adelantado, Firebase responde 412 y devolvemos
 * `false` en vez de lanzar un error, para que quien llama pueda releer
 * los datos ya actualizados y reintentar sobre ellos.
 */
async function writeFirebaseIfMatch(fileName, data, etag) {
  const res = await fetch(firebaseUrl(fileName), {
    method: "PUT",
    headers: { "Content-Type": "application/json", "if-match": etag ?? "*" },
    body: JSON.stringify(data),
  });
  if (res.status === 412) return false;
  if (!res.ok) {
    throw new Error(`No se ha podido guardar "${fileName}" en Firebase (HTTP ${res.status}).`);
  }
  return true;
}

/**
 * ------------------------------------------------------------------
 *  Por qué existe esto: evitar que una escritura "se pierda"
 * ------------------------------------------------------------------
 * `readJsonStore` + modificar en memoria + `writeJsonStore` (leer TODO
 * el fichero, cambiarlo, y volver a guardarlo TODO) tiene un fallo
 * clásico en un hosting serverless como Vercel: si dos peticiones llegan
 * casi a la vez (dos compras distintas creándose a la vez, o alguien
 * borra un pedido justo cuando llega la confirmación de pago de otro),
 * cada una puede leer los datos ANTES de que la otra termine de guardar
 * los suyos — y la segunda en guardar "gana", borrando sin querer el
 * cambio de la primera. Con ficheros en tu propio ordenador esto casi
 * nunca pasa porque todo va por el mismo proceso, uno detrás de otro
 * (y aun así lo protegemos con `withLock` más abajo); pero en Vercel,
 * dos peticiones a la vez pueden ejecutarse en instancias totalmente
 * separadas, sin nada en común entre ellas.
 *
 * La solución: en vez de "leo, modifico, guardo" a ciegas, se hace
 * "leo con una ETag, modifico, guardo SOLO SI nadie más ha escrito
 * desde que leí" (lo que Firebase llama una escritura condicional). Si
 * alguien se adelantó, se vuelve a leer el dato ya actualizado, se
 * vuelve a aplicar el cambio sobre ese dato fresco, y se reintenta —
 * así ninguna escritura desaparece silenciosamente, pase lo que pase
 * con el orden de llegada.
 * ------------------------------------------------------------------
 */
async function updateFirebase(fileName, defaultValue, updater) {
  const MAX_ATTEMPTS = 8;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { value, etag } = await readFirebaseWithTag(fileName, defaultValue);
    const result = await updater(value);
    // El `updater` puede devolver `{ next: undefined }` para decir "no
    // hay nada que cambiar" (por ejemplo, borrar un pedido que no
    // existe) sin gastar una escritura de más.
    if (result.next === undefined) return result;
    const wrote = await writeFirebaseIfMatch(fileName, result.next, etag);
    if (wrote) return result;
    // Alguien escribió a la vez (412): se reintenta desde datos frescos.
  }
  throw new Error(
    `No se ha podido actualizar "${fileName}": demasiadas escrituras simultáneas a la vez.`
  );
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

// En modo fichero local, `withLock` ya serializa todas las lecturas y
// escrituras de un mismo fichero (una detrás de otra, nunca a la vez),
// así que aquí "leer, modificar, guardar" dentro del mismo `withLock` ya
// es seguro por sí solo — no hace falta ETag ni reintentos.
async function updateFile(fileName, defaultValue, updater) {
  return withLock(fileName, async () => {
    const filePath = await ensureFile(fileName, defaultValue);
    const raw = await readFile(filePath, "utf-8");
    let value;
    try {
      value = JSON.parse(raw);
    } catch {
      value = defaultValue;
    }
    const result = await updater(value);
    if (result.next === undefined) return result;
    await writeFile(filePath, JSON.stringify(result.next, null, 2), "utf-8");
    return result;
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

/**
 * Lee, modifica y guarda como una única operación seguro frente a
 * escrituras simultáneas (ver la explicación larga más arriba, junto a
 * `updateFirebase`). `updater(value)` recibe los datos actuales y debe
 * devolver `{ next, ...resto }`: `next` son los datos ya modificados que
 * se van a guardar (o `undefined` si no hay nada que guardar), y
 * `...resto` es cualquier otro dato que quien llama quiera recuperar
 * (por ejemplo, si el pedido que se quería borrar existía o no).
 */
export async function updateJsonStore(fileName, defaultValue, updater) {
  return useFirebase
    ? updateFirebase(fileName, defaultValue, updater)
    : updateFile(fileName, defaultValue, updater);
}
