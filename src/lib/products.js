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
    slug: "guia-reventa-vinted-wallapop",
    name: "GUIA DE REVENTA: Revende como un PRO en Vinted y Wallapop 🚀",
    category: "Formación y Negocios",
    price: 990,
    image: "/products/guia-reventa-vinted-wallapop.jpg",
    // Enlace real donde vive el contenido de la guía (fuera de esta web).
    // En cuanto Stripe confirma el pago, este enlace se manda por email
    // al comprador (ver src/server/payments/stripe.js → deliverPaidOrder
    // y src/server/auth/mailer.js). Si algún producto no trae este campo,
    // el email avisa de que se le contactará a mano en su lugar, así que
    // añadir esto no es obligatorio para que la tienda funcione.
    accessUrl: "https://guia-reventa-vinted-wallapop.vercel.app/",

    description:
      "¿Quieres dejar de vender solo lo que te sobra y empezar a generar ingresos reales mes a mes? Esta guía digital interactiva (Edición 2026) te enseña el método completo y repetible para convertir la compraventa de segunda mano en un negocio rentable, vendas ropa, zapatillas o tecnología — nada de PDF teórico y aburrido.",
    // "Qué vas a dominar": el temario en forma de bloques, pensado para
    // una guía/curso — los productos físicos de ejemplo no usan este
    // campo, así que la página de producto solo lo muestra si existe.
    highlights: [
      {
        emoji: "🛒",
        title: "Los Cimientos (Sourcing)",
        text: "Qué nichos funcionan (y cuáles evitar), cómo calcular tu margen real y las 6 fuentes clave para comprar barato.",
      },
      {
        emoji: "📸",
        title: "El Anuncio Perfecto",
        text: "Fotos que generan confianza, y cómo estructurar títulos y descripciones con el SEO adecuado para posicionarte el primero.",
      },
      {
        emoji: "🤝",
        title: "Cerrar la Venta",
        text: "Negocia sin regalar tu margen, detecta estafas al instante y gestiona envíos y empaquetado de forma impecable.",
      },
      {
        emoji: "📈",
        title: "Escalar el Negocio",
        text: "Organización, adaptación a la nueva normativa de Hacienda (DAC7) y los errores de novato que más dinero cuestan.",
      },
    ],
    details: [
      "Formato: guía web interactiva (responsive) — adiós a los PDFs estáticos",
      "Acceso inmediato y de por vida (incluye futuras actualizaciones de la Edición 2026)",
      "Incluye Plan de 30 días, plantillas de negociación y checklists interactivas",
      "Licencia de Reventa (MRR) incluida",
    ],
    accent: "from-emerald-500/30 to-teal-700/25",
  },
  {
    slug: "guia-interactiva-shopify-2026",
    name: "Guía Interactiva Shopify: Crea tu Tienda desde Cero y Empieza a Vender",
    category: "Formación y Negocios",
    price: 999,
    // Precio tachado junto al de oferta (ver ProductCard y la ficha de
    // producto): es opcional, así que los productos que no lo tengan
    // siguen mostrando solo su precio normal, sin cambiar nada más.
    compareAtPrice: 1699,
    image: "/products/guia-shopify-2026.jpg",
    // Segunda imagen, mostrada más abajo en la propia ficha del producto
    // como vista previa de cómo es la guía por dentro (opcional, igual
    // que `image`).
    secondaryImage: "/products/guia-shopify-2026-interior.png",
    // Enlace real donde vive el contenido de la guía. Se manda por email
    // en cuanto se confirma el pago (ver deliverPaidOrder en
    // src/server/payments/stripe.js) y solo se resuelve en el servidor
    // (ver cuenta/page.js) — nunca llega al navegador de nadie que no
    // haya pagado ese pedido en concreto.
    accessUrl: "https://guia-tienda-shopify.vercel.app/",

    description:
      "¿Quieres vender por internet pero la parte técnica te frena? Lanza tu propio ecommerce en Shopify sin necesidad de saber programar con esta guía digital interactiva. Es el paso a paso definitivo para pasar de \"no tengo tienda\" a recibir tu primer pedido.",
    highlights: [
      {
        emoji: "⚙️",
        title: "Configuración Inicial",
        text: "Abre tu cuenta, elige el plan y configura pagos y envíos sin estrés.",
      },
      {
        emoji: "🎨",
        title: "Diseño que Vende",
        text: "Crea una tienda visualmente atractiva que genere confianza al instante.",
      },
      {
        emoji: "📦",
        title: "Gestión de Productos",
        text: "Sube tu catálogo y escribe descripciones que conviertan.",
      },
      {
        emoji: "🚀",
        title: "Lanzamiento",
        text: "Qué hacer justo después de darle a \"Publicar\" para atraer tráfico.",
      },
    ],
    details: [
      "Formato: guía web interactiva (responsive)",
      "Acceso inmediato y de por vida",
      "Nivel principiante — cero código necesario",
      "Licencia de Reventa (MRR) incluida",
    ],
    accent: "from-sky-500/30 to-indigo-700/25",
  },
  {
    slug: "bruma-de-cedro",
    name: "Bruma de Cedro",
    category: "Aromas",
    price: 1900,
    description:
      "Bruma textil e ambiental con base de cedro y toques de bergamota. Perfecta para renovar cualquier estancia.",
    details: ["100 ml", "Sin alcohol agresivo", "Apta para textiles", "Aroma de larga duración"],
    accent: "from-stone-500/25 to-emerald-700/25",
  },
  {
    slug: "taza-terracota",
    name: "Taza Terracota",
    category: "Cerámica",
    price: 1600,
    description:
      "Taza de cerámica esmaltada a mano, tono terracota mate. Cada pieza es única, con pequeñas variaciones de artesanía.",
    details: ["350 ml", "Apta para microondas", "Esmaltada a mano", "Pieza única"],
    accent: "from-orange-500/30 to-rose-700/25",
  },
  {
    slug: "difusor-de-lino",
    name: "Difusor de Lino",
    category: "Aromas",
    price: 2900,
    description:
      "Difusor de varillas con esencia de flor de lino y almizcle blanco. Aroma suave y constante durante meses.",
    details: ["200 ml", "6 varillas de ratán", "Hasta 4 meses de uso", "Sin llama"],
    accent: "from-slate-500/25 to-stone-600/25",
  },
  {
    slug: "manta-lana-cruda",
    name: "Manta de Lana Cruda",
    category: "Textil",
    price: 5900,
    description:
      "Manta tejida en lana cruda sin teñir, 130x180cm. Cálida, transpirable y de tacto natural.",
    details: ["130 x 180 cm", "Lana 100% sin teñir", "Tejido tradicional", "Cuidado en seco"],
    accent: "from-neutral-500/25 to-amber-700/20",
  },
  {
    slug: "jabon-avena-miel",
    name: "Jabón Avena y Miel",
    category: "Cuidado",
    price: 900,
    description:
      "Jabón artesanal exfoliante con avena y miel cruda. Ideal para pieles sensibles.",
    details: ["120 g", "Saponificación en frío", "Sin sulfatos", "Vegano excepto la miel"],
    accent: "from-yellow-500/25 to-amber-700/25",
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
