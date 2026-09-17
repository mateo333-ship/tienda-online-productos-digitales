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

## Qué hay construido y qué es todavía una maqueta

Para que puedas probar la tienda entera hoy mismo, sin depender de nada
externo, algunas piezas son un "simulador" honesto de lo que serán en
producción. Aquí está la lista completa, sin sorpresas:

| Pieza | Estado hoy | Qué falta para producción |
|---|---|---|
| Catálogo de productos | Datos de ejemplo en `src/lib/products.js` | Conectar una base de datos (ver más abajo) |
| Cuentas de cliente, contraseñas, sesiones | **Real y funcional**: contraseñas con hash bcrypt, sesión cifrada, verificación por email | Ninguna, esto ya está bien hecho — solo falta desplegar con HTTPS |
| Envío del código de verificación | Se escribe en la consola del servidor (y se muestra en pantalla solo en desarrollo) | Conectar un proveedor de email real (Resend, Postmark, SES...) en `src/server/auth/mailer.js` |
| Guardado de usuarios y pedidos | Ficheros JSON en `src/server/data/` (no se suben a git) | Sustituir por una base de datos real — todo el código ya está organizado para que este cambio sea pequeño (ver abajo) |
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
