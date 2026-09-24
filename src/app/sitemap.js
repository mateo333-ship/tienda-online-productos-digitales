import { getAllProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap para que Google (y cualquier buscador) sepa qué páginas
 * existen sin tener que descubrirlas solo a base de seguir enlaces.
 * Next genera automáticamente `/sitemap.xml` a partir de este archivo —
 * no hace falta escribir el XML a mano ni mantenerlo aparte.
 *
 * Solo llevan aquí las páginas públicas con contenido real: ni el
 * carrito, ni "Mi cuenta", ni login/verificación (esas ya llevan
 * `robots: { index: false }` en su propia metadata, ver esos archivos) —
 * un sitemap con páginas que no se deben indexar solo confunde al
 * buscador sobre qué es importante en la web.
 */
export default function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: "", changeFrequency: "weekly", priority: 1 },
    { url: "/productos", changeFrequency: "weekly", priority: 0.9 },
    { url: "/contacto", changeFrequency: "yearly", priority: 0.3 },
    { url: "/envios-pagos", changeFrequency: "yearly", priority: 0.3 },
    { url: "/privacidad", changeFrequency: "yearly", priority: 0.1 },
    { url: "/terminos", changeFrequency: "yearly", priority: 0.1 },
    { url: "/cookies", changeFrequency: "yearly", priority: 0.1 },
  ].map((route) => ({
    url: `${SITE_URL}${route.url}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productRoutes = getAllProducts().map((product) => ({
    url: `${SITE_URL}/productos/${product.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
