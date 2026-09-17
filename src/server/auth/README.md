# `src/server/auth` — módulo aislado de autenticación

Esta carpeta está **deliberadamente separada** del resto de la aplicación
(`src/app`, `src/components`) por seguridad:

- Todos los ficheros empiezan con `import "server-only"`. Esto hace que, si
  alguna vez alguien importa por error uno de estos ficheros desde un
  componente de cliente (`"use client"`), **el build falle** en lugar de
  enviar silenciosamente secretos (contraseñas, claves) al navegador.
- Nada de lo que hay aquí se incluye jamás en el JavaScript que descarga el
  navegador. Solo se ejecuta en el servidor (Route Handlers de `src/app/api`
  y páginas de servidor).
- Los datos sensibles (contraseñas, códigos de verificación) nunca se
  guardan en texto plano: las contraseñas se **hashean** con bcrypt y los
  códigos de un solo uso se hashean con SHA-256 antes de tocar el disco.

## Ficheros

| Fichero | Qué hace |
|---|---|
| `crypto.js` | Hashing de contraseñas (bcrypt) y generación/verificación de códigos OTP. |
| `session.js` | Crea y valida la cookie de sesión, **cifrada** (no solo firmada) con `jose` (JWE, AES-256-GCM). |
| `users-repo.js` | Acceso a los datos de usuarios. Hoy usa un fichero JSON local; es el único sitio a tocar cuando conectéis una base de datos real. |
| `orders-repo.js` | Acceso a los pedidos de cada usuario. Mismo patrón que `users-repo.js`. |
| `rate-limit.js` | Límite sencillo de intentos (login, registro, códigos) para dificultar ataques de fuerza bruta. |

## Sobre "cifrar el código para que nadie pueda entrar"

Es importante ser honestos sobre esto: el HTML/CSS/JS que ve el navegador
**nunca puede estar realmente oculto** — cualquier página web, "cifrada" o
no, se puede inspeccionar con las herramientas de desarrollador del
navegador. Eso es cómo funciona la web y no es un fallo de esta tienda.

Lo que sí protege de verdad los datos de tus clientes es:

1. Que el código que maneja contraseñas y sesiones **nunca se ejecute en el
   navegador**, solo en el servidor (por eso esta carpeta está aislada).
2. Que las contraseñas se guarden **hasheadas** (irreversibles), no
   cifradas ni en texto plano — así ni tú ni nadie que accediera a la base
   de datos podría leerlas.
3. Que la sesión de cada cliente esté en una cookie `httpOnly` + `secure` +
   cifrada, que el JavaScript de la página ni siquiera puede leer.
4. Que cada respuesta del servidor compruebe que el pedido/dato pertenece
   al usuario que ha iniciado sesión (nunca te fíes de lo que dice el
   navegador sobre "quién soy").
5. Desplegar la web con **HTTPS** (TLS) — esto es lo que de verdad cifra
   los datos "de extremo a extremo" entre el navegador del cliente y tu
   servidor. Sin HTTPS, nada de lo anterior sirve de mucho. Cualquier
   proveedor de hosting serio (Vercel, Hostinger, etc.) lo activa por ti
   gratis.

Este módulo implementa los puntos 1-4. El punto 5 depende de dónde
despliegues la web (ver el README principal del proyecto).
