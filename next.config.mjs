// Si hay ID de Google Analytics configurado (NEXT_PUBLIC_GA_ID), la CSP de
// abajo abre hueco justo a los dominios de Google que hacen falta para que
// cargue (script-src) y para que pueda enviar las visitas (connect-src).
// Sin esa variable, no se abre ningún hueco de más: la política se queda
// tan cerrada como estaba antes de tener analítica.
const gaEnabled = Boolean(process.env.NEXT_PUBLIC_GA_ID);

// Cabeceras de seguridad para todas las respuestas.
// Ninguna de estas protege datos que ya estuvieran expuestos: son capas
// adicionales que reducen ataques típicos del navegador (clickjacking,
// "sniffing" de tipos de archivo, fuga de la URL actual a otros sitios al
// seguir un enlace, o que un script inyectado cargue cosas de fuera).
const securityHeaders = [
  // Evita que la web se pueda incrustar en un <iframe> de otro sitio
  // (protección frente a "clickjacking": que alguien superponga botones
  // invisibles de tu cuenta o del pago sobre una página ajena).
  { key: "X-Frame-Options", value: "DENY" },
  // El navegador no debe "adivinar" el tipo de un archivo distinto al
  // que el servidor ha declarado (evita que un archivo subido como texto
  // se acabe ejecutando como script en algunos navegadores antiguos).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Al seguir un enlace hacia otro sitio, no reveles la URL completa en la
  // que estabas (por ejemplo, con un id de pedido en ella), solo el origen.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Obliga a HTTPS en visitas futuras durante 2 años, incluidos subdominios.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Desactiva APIs del navegador (cámara, micrófono, geolocalización...)
  // que esta web no usa, por si algún script de terceros se colara.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Content-Security-Policy: por defecto solo se puede cargar de nuestro
  // propio origen. La web no usa Stripe.js en el navegador (el pago se hace
  // en la propia página de Stripe, a la que simplemente se redirige), así
  // que no hace falta abrir hueco a ningún otro dominio salvo, cuando la
  // analítica de Google está activa, los dominios de Google que necesita.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${gaEnabled ? " https://www.googletagmanager.com" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data:${gaEnabled ? " https://www.google-analytics.com" : ""}`,
      "font-src 'self' data:",
      `connect-src 'self'${
        gaEnabled
          ? " https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com"
          : ""
      }`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
