/**
 * Catálogo de productos.
 *
 * ⚠️ DATOS DE EJEMPLO — esto es un array en memoria para que la tienda
 * funcione hoy mismo sin base de datos. Cuando conectéis una base de datos
 * real (Postgres, MySQL, etc.) esta función es el único sitio que hay que
 * cambiar: que en lugar de devolver este array, haga la consulta a la BD.
 * El resto de la web (páginas, carrito, etc.) no tiene que cambiar nada
 * porque siempre habla con estas funciones, nunca con el array directamente.
 */

const PRODUCTS = [
  {
    slug: "vela-ambar",
    name: "Vela Ámbar",
    category: "Velas",
    price: 2400,
    description:
      "Vela de cera de soja con notas de ámbar y madera de sándalo. Combustión limpia de hasta 45 horas.",
    details: ["Cera de soja 100% natural", "Mecha de algodón sin plomo", "45h de combustión", "Hecha a mano"],
    accent: "from-amber-200 to-orange-300",
  },
  {
    slug: "bruma-de-cedro",
    name: "Bruma de Cedro",
    category: "Aromas",
    price: 1900,
    description:
      "Bruma textil e ambiental con base de cedro y toques de bergamota. Perfecta para renovar cualquier estancia.",
    details: ["100 ml", "Sin alcohol agresivo", "Apta para textiles", "Aroma de larga duración"],
    accent: "from-stone-200 to-emerald-200",
  },
  {
    slug: "taza-terracota",
    name: "Taza Terracota",
    category: "Cerámica",
    price: 1600,
    description:
      "Taza de cerámica esmaltada a mano, tono terracota mate. Cada pieza es única, con pequeñas variaciones de artesanía.",
    details: ["350 ml", "Apta para microondas", "Esmaltada a mano", "Pieza única"],
    accent: "from-orange-200 to-rose-200",
  },
  {
    slug: "difusor-de-lino",
    name: "Difusor de Lino",
    category: "Aromas",
    price: 2900,
    description:
      "Difusor de varillas con esencia de flor de lino y almizcle blanco. Aroma suave y constante durante meses.",
    details: ["200 ml", "6 varillas de ratán", "Hasta 4 meses de uso", "Sin llama"],
    accent: "from-slate-200 to-stone-300",
  },
  {
    slug: "manta-lana-cruda",
    name: "Manta de Lana Cruda",
    category: "Textil",
    price: 5900,
    description:
      "Manta tejida en lana cruda sin teñir, 130x180cm. Cálida, transpirable y de tacto natural.",
    details: ["130 x 180 cm", "Lana 100% sin teñir", "Tejido tradicional", "Cuidado en seco"],
    accent: "from-neutral-200 to-amber-100",
  },
  {
    slug: "jabon-avena-miel",
    name: "Jabón Avena y Miel",
    category: "Cuidado",
    price: 900,
    description:
      "Jabón artesanal exfoliante con avena y miel cruda. Ideal para pieles sensibles.",
    details: ["120 g", "Saponificación en frío", "Sin sulfatos", "Vegano excepto la miel"],
    accent: "from-yellow-100 to-amber-200",
  },
];

export function getAllProducts() {
  return PRODUCTS;
}

export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export function getFeaturedProducts(limit = 3) {
  return PRODUCTS.slice(0, limit);
}

export function getCategories() {
  return Array.from(new Set(PRODUCTS.map((p) => p.category)));
}
