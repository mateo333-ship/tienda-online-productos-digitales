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
  // propio origen. La web no carga scripts externos ni imágenes remotas ni
  // usa Stripe.js en el navegador (el pago se hace en la propia página de
  // Stripe, a la que simplemente se redirige), así que no hace falta abrir
  // hueco a ningún otro dominio.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "connect-src 'self'",
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
