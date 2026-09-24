/**
 * URL pública de la tienda, en un único sitio (mismo patrón que
 * `products.js` y `legal-info.js`): la usan el sitemap, `robots.txt` y
 * las etiquetas Open Graph/canonical de `layout.js`, así que cuando
 * conectes un dominio propio solo hay que cambiar esto — nada más se
 * queda apuntando a la URL antigua de Vercel.
 *
 * Se puede sobreescribir con la variable de entorno NEXT_PUBLIC_SITE_URL
 * (recomendado en cuanto tengas dominio propio: en Vercel, Project
 * Settings → Environment Variables). Mientras tanto, cae en la URL de
 * producción actual en vercel.app para que el sitemap y las etiquetas
 * Open Graph funcionen ya, sin esperar al dominio.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://tienda-online-productos-digitales.vercel.app";
