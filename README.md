# Terra Casa — tienda online

Tienda de ejemplo construida con Next.js (React) + Tailwind CSS. Incluye
catálogo, carrito, registro con verificación de email por código,
inicio de sesión, y un perfil de cliente con sus pedidos.

## Puesta en marcha

Necesitas [Node.js](https://nodejs.org) instalado (versión 20 o superior).

```bash
npm install
npm run dev
```

Abre http://localhost:3000. En modo desarrollo, cuando te registres, el
código de verificación aparece directamente en la pantalla (marcado como
"modo demo") porque todavía no hay un proveedor de email conectado — ver
más abajo.

Antes de desplegarla de verdad, copia `.env.local.example` como
`.env.local` y genera tu propio secreto:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Poner la tienda en producción (Vercel)

Si has desplegado (o vas a desplegar) esta web en Vercel y el registro o
el inicio de sesión te daban un error como
`Failed to execute 'json' on 'Response': Unexpected end of JSON input`,
es por esto: **en local, guardar los usuarios en un fichero JSON
funciona porque el disco es tuyo y no se borra. En Vercel no** — las
funciones se ejecutan en un disco de solo lectura que además se reinicia
todo el rato, así que cualquier intento de guardar un usuario fallaba
por dentro, y el navegador recibía una respuesta vacía en vez de JSON.

Para que funcione de verdad en Vercel hacen falta dos cosas:

### 1. Un proyecto de Firebase con Realtime Database

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
   y crea un proyecto (es gratis; no hace falta tarjeta para lo que
   necesita esta tienda).
2. En el menú lateral, entra en **Realtime Database** → **Crear base de
   datos**. Puedes elegir "modo bloqueado" (el más seguro) al crearla.
   Anota la URL que te da (algo como
   `https://tu-proyecto-default-rtdb.europe-west1.firebasedatabase.app`).
3. Ve a **Configuración del proyecto** (el engranaje) → **Cuentas de
   servicio**. Si ahí ves un aviso de que tu organización no permite
   crear claves de cuenta de servicio (es una política de seguridad de
   Google cada vez más habitual, no algo que hayas hecho mal), no hace
   falta pelearse con ella: en el panel de la izquierda de esa misma
   pantalla, bajo **"Credenciales heredadas"**, pulsa **"Secretos de la
   base de datos"** y copia el secreto que te muestra (o genera uno
   nuevo con "Añadir secreto" si no hay ninguno). Ese único valor es
   todo lo que necesitamos — no hace falta ningún fichero `.json`.
4. En Vercel: tu proyecto → **Settings** → **Environment Variables**, y
   añade estas dos variables:

   | Variable | Valor |
   |---|---|
   | `FIREBASE_DATABASE_URL` | la URL de tu Realtime Database del paso 2 |
   | `FIREBASE_DATABASE_SECRET` | el secreto que copiaste en el paso 3 |

   El código ya está preparado para detectar estas dos variables y usar
   Firebase automáticamente en cuanto existan — no hay que tocar nada
   más. Guarda ese secreto con el mismo cuidado que una contraseña: con
   él se puede leer y escribir toda la base de datos.

### 2. La variable `SESSION_SECRET`, para las sesiones

En Vercel: tu proyecto → **Settings** → **Environment Variables** →
añade `SESSION_SECRET` con un valor largo y aleatorio. Puedes generarlo
en tu ordenador con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Nunca** subas tu `.env.local` a GitHub ni reutilices el mismo secreto
en varios proyectos.

---

Después de añadir las tres variables (las dos de Firebase más
`SESSION_SECRET`), haz un **redeploy** (Vercel no
las aplica a un despliegue que ya existía). Con eso, el registro, la
verificación por código y el inicio de sesión deberían funcionar igual
que en tu ordenador — solo que ahora los datos se guardan en tu
Realtime Database, y puedes verlos en tiempo real desde la propia
consola de Firebase (pestaña Realtime Database), bajo el nodo `tienda`.

Si algo sigue fallando: en Vercel, pestaña **Logs** de tu proyecto,
verás el error real (todas las rutas de la API atrapan cualquier fallo
inesperado y lo escriben ahí, en vez de dejar que el navegador reciba
una respuesta vacía).

En tu ordenador no tienes que hacer nada de esto: si no existen esas
variables de Redis, la web sigue usando ficheros JSON locales
automáticamente, como hasta ahora.

## Qué hay construido y qué es todavía una maqueta

Para que puedas probar la tienda entera hoy mismo, sin depender de nada
externo, algunas piezas son un "simulador" honesto de lo que serán en
producción. Aquí está la lista completa, sin sorpresas:

| Pieza | Estado hoy | Qué falta para producción |
|---|---|---|
| Catálogo de productos | Datos de ejemplo en `src/lib/products.js` | Conectar una base de datos (ver más abajo) |
| Cuentas de cliente, contraseñas, sesiones | **Real y funcional**: contraseñas con hash bcrypt, sesión cifrada, verificación por email | Ninguna, esto ya está bien hecho — solo falta desplegar con HTTPS |
| Envío del código de verificación | Se escribe en la consola del servidor (y se muestra en pantalla solo en desarrollo) | Conectar un proveedor de email real (Resend, Postmark, SES...) en `src/server/auth/mailer.js` |
| Guardado de usuarios y pedidos | Ficheros JSON en local; en Vercel usa Firebase Realtime Database si configuras las variables de entorno (ver "Poner la tienda en producción" más arriba) | Puedes seguir así, o migrar a otra base de datos más adelante — el código ya está organizado para que ese cambio sea pequeño (ver abajo) |
| Pago | No implementado — "confirmar pedido" solo guarda el pedido | Conectar una pasarela de pago (Stripe, Redsys...) |

## Cómo está protegida la cuenta de cada cliente

Esto es importante y queremos ser claros, porque el pedido original
mencionaba "cifrar el código para que nadie pueda entrar". Vale la pena
explicar qué es realmente posible en la web y qué no:

- **El HTML/CSS/JS de cualquier página web se puede inspeccionar siempre**,
  la tuya y la de cualquiera. Eso no es un fallo de esta tienda, es cómo
  funciona un navegador. "Cifrar" ese código no impide que alguien lo vea.
- Lo que sí protege de verdad los datos de tus clientes:
  1. Las contraseñas nunca se guardan en texto plano ni "cifradas": se
     guardan **hasheadas** con bcrypt, que es irreversible incluso para
     vosotros mismos.
  2. Toda la lógica de sesiones y contraseñas vive en `src/server/auth/`,
     una carpeta **aislada** del resto del código y marcada con
     `import "server-only"` — si alguien intentara usarla por error desde
     el navegador, el proyecto directamente no compilaría.
  3. La sesión de cada cliente se guarda en una cookie `httpOnly` +
     **cifrada** (con `jose`, algoritmo AES-256-GCM) — ni JavaScript en la
     página ni un tercero pueden leer ni falsificar quién ha iniciado
     sesión.
  4. Cada endpoint que devuelve datos (por ejemplo, los pedidos del
     perfil) comprueba en el servidor la sesión y filtra siempre por el
     usuario real — nunca se confía en lo que diga el navegador. Puedes
     verlo en `src/app/api/orders/route.js` y en `src/app/cuenta/page.js`.
  5. **Falta el paso más importante para producción: desplegar con
     HTTPS.** Eso es lo que realmente cifra la comunicación entre el
     navegador de tu cliente y tu servidor ("de extremo a extremo", en la
     práctica). Cualquier hosting serio (Vercel, Railway, Hostinger con
     SSL, etc.) lo activa automáticamente o con un clic.

Más detalle técnico en `src/server/auth/README.md`.

## Cómo conectar una base de datos real más adelante

Todo el acceso a datos pasa por dos ficheros:

- `src/server/auth/users-repo.js` (usuarios)
- `src/server/auth/orders-repo.js` (pedidos)
- `src/lib/products.js` (catálogo)

Cada función de esos ficheros hoy lee/escribe un JSON local. El día que
tengáis una base de datos (por ejemplo Postgres con [Prisma](https://prisma.io)
o [Supabase](https://supabase.com)), solo hay que reescribir el interior
de esas funciones para que hagan una consulta SQL en lugar de leer el
JSON — la forma de entrada/salida de cada función se mantiene igual, así
que ninguna página ni componente del resto de la web tiene que cambiar.

## Paleta de colores

Los colores de toda la web (fondo, superficies, texto, bordes) se tomaron
midiendo directamente los estilos reales de **solreader.com**: fondo casi
negro (`#141414`), texto blanco cálido (`#fbfef9`) y un gris medio para
superficies secundarias — esa web no usa ningún color saturado propio.
Sobre esa base neutra y oscura, el verde neón de la plantilla de botón
que pediste (`--accent` en `src/app/globals.css`) queda como único acento
de color de la interfaz. El formulario de inicio de sesión / registro
usa esas mismas variables de color, pero mantiene exactamente la misma
estructura HTML y el mismo comportamiento que antes.

## Componentes de diseño usados

- Formulario de inicio de sesión / registro: plantilla de
  [Uiverse.io by Yaya12085](https://uiverse.io/), clases `.form-container`,
  `.sign`, etc. en `src/app/globals.css`, envuelta con la lógica de
  peticiones en `src/components/auth-form.js`.
- Botón principal de la web: plantilla de
  [Uiverse.io by BHARGAVPATEL1244](https://uiverse.io/), clase `.btn-neon`
  en `src/app/globals.css`, usada a través de `src/components/ui/button.js`.
- Formulario de contacto: plantilla de
  [Uiverse.io by themrsami](https://uiverse.io/), en
  `src/components/contact-form.js`.
- Campo de código de verificación: inspirado en el componente
  `swamimalode07/rare-ui/otp-input` para shadcn. El entorno donde se ha
  construido este proyecto no tenía salida a `ui.shadcn.com` (estaba
  bloqueada por la configuración de red del sandbox), así que el
  componente está hecho a mano en `src/components/otp-input.js` con el
  mismo comportamiento (casillas individuales, pegado de código, foco
  automático). Si en tu ordenador tienes shadcn funcionando, puedes
  sustituirlo ejecutando:

  ```bash
  npx shadcn@latest add swamimalode07/rare-ui/otp-input
  ```

## Estructura del proyecto

```
src/
  app/            páginas (Next.js App Router) y rutas de API
  components/     componentes de interfaz reutilizables
  lib/            utilidades y catálogo de productos
  server/
    auth/         módulo aislado de autenticación (server-only)
    data/         "base de datos" en JSON (no se sube a git)
```
