import { SITE_URL } from "@/lib/site";

/**
 * `robots.txt`, generado por Next a partir de este archivo. Deja indexar
 * todo lo público, pero bloquea las rutas de API y las páginas privadas
 * o transaccionales (cuenta, login, verificación, carrito) — no porque
 * tengan datos sensibles en el propio HTML (la sesión ya protege eso),
 * sino porque no aportan nada a alguien que llega desde un buscador y
 * solo diluirían la relevancia de las páginas que sí importan.
 * Complementa (no sustituye) el `robots: { index: false }` que ya llevan
 * cuenta/login/verificar en su propia metadata.
 */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/cuenta", "/login", "/verificar", "/carrito"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
