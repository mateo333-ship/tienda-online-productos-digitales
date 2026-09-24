import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/add-to-cart-button";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.name,
    description: product.description,
    // Sin esto, compartir el enlace de un producto concreto (WhatsApp,
    // redes) enseñaría la imagen genérica de la home en vez de la del
    // propio producto — mucho menos útil para quien lo recibe.
    openGraph: product.image
      ? { title: product.name, description: product.description, images: [product.image] }
      : { title: product.name, description: product.description },
  };
}

export default async function ProductoPage({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Igual que en la tarjeta del catálogo: foto real si existe
            (`image`), degradado de color si no. */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-[var(--surface)]">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
                className="object-cover"
              />
            ) : (
              <div className={`h-full w-full bg-gradient-to-br ${product.accent}`} />
            )}
          </div>
          {/* Antes esta llamada a "Así es por dentro" solo existía como
              título de sección al final de la página, después del
              temario — fácil de no llegar a ver nunca. Este enlace, justo
              debajo de la foto principal, se ve sin apenas hacer scroll y
              lleva directo a esa sección (que además ahora está la
              primera después de la cabecera, ver más abajo). */}
          {product.secondaryImage && (
            <a
              href="#por-dentro"
              className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm transition hover:border-[var(--accent)]"
            >
              <span className="flex items-center gap-2 font-medium">
                👀 Mira cómo es por dentro
              </span>
              <span className="text-[var(--ink-soft)]">↓</span>
            </a>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">
            {product.category}
          </p>
          <h1 className="mt-2 font-serif text-4xl">{product.name}</h1>
          {/* `compareAtPrice` es opcional: solo se ve el precio tachado en
              los productos que están de oferta. */}
          <p className="mt-4 flex items-baseline gap-3">
            {product.compareAtPrice && (
              <span className="text-lg text-[var(--ink-soft)] line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span className="text-xl font-semibold">{formatPrice(product.price)}</span>
          </p>
          <p className="mt-6 max-w-md text-[var(--ink-soft)]">{product.description}</p>

          <ul className="mt-6 space-y-2 text-sm text-[var(--ink-soft)]">
            {product.details.map((d) => (
              <li key={d} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)]" />
                {d}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {/* ⚠️ OJO con lo que se le pasa a un Client Component: a
                diferencia del resto de esta página (que se queda en el
                servidor y solo manda el HTML ya renderizado), TODO lo que
                se le pasa como prop a un componente "use client" como
                `AddToCartButton` viaja tal cual hasta el navegador para
                poder hidratarlo — aunque ese componente nunca llegue a
                mostrarlo en pantalla. Pasarle `product` entero mandaría
                también su `accessUrl` (el enlace real y privado de
                descarga) al HTML público de la página, visible para
                cualquiera que la visite sin haber pagado — ni falta
                inspeccionar nada raro, basta con "ver código fuente". Por
                eso aquí se le pasa solo lo que el carrito necesita de
                verdad (`slug`, `name`, `price` — lo único que usa
                `addItem` en cart-provider.js), nunca el objeto completo. */}
            <AddToCartButton product={{ slug: product.slug, name: product.name, price: product.price }} />
          </div>
          {/* Recordatorio del código justo en el momento de decidir la
              compra, en el mismo estilo compacto que en el catálogo y el
              carrito — no otro banner grande, solo esta línea. */}
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-medium">
            ✨ Código <strong className="font-semibold">DIGITAL10</strong> — 10% de descuento en tu
            primer pedido
          </p>
          <p className="mt-3 text-xs text-[var(--ink-soft)]">
            📩 Acceso inmediato: al ser un producto 100% digital, lo recibes al instante tras la
            compra.
          </p>
        </div>
      </div>

      {/* Segunda imagen (`secondaryImage`), opcional: una vista previa de
          cómo es el producto por dentro. Va la primera sección después de
          la cabecera (antes incluso del temario) precisamente para que se
          vea sin tener que bajar mucho — el enlace "Mira cómo es por
          dentro" de más arriba trae aquí directo. `scroll-mt-24` evita que
          la cabecera fija de la web (que se queda pegada arriba) tape el
          principio de la sección al saltar con ese enlace. Se muestra a su
          tamaño real (sin recortar) porque suele ser una captura de
          pantalla, no una foto de producto. */}
      {product.secondaryImage && (
        <div id="por-dentro" className="mt-16 scroll-mt-24 border-t border-[var(--border)] pt-12">
          <h2 className="font-serif text-2xl">Así es por dentro</h2>
          <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <Image
              src={product.secondaryImage}
              alt={`Vista previa de ${product.name}`}
              width={product.secondaryImageSize?.width ?? 1471}
              height={product.secondaryImageSize?.height ?? 909}
              sizes="(min-width: 1024px) 800px, 100vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      )}

      {/* "Qué vas a dominar": solo los productos tipo curso/ebook traen este
          temario (campo `highlights`); el resto de la ficha no cambia si no
          existe, así que esto no rompe los productos de ejemplo. */}
      {product.highlights?.length > 0 && (
        <div className="mt-16 border-t border-[var(--border)] pt-12">
          <h2 className="font-serif text-2xl">¿Qué vas a dominar con esta guía?</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {product.highlights.map((h) => (
              <div key={h.title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <p className="text-2xl">{h.emoji}</p>
                <h3 className="mt-3 font-medium">{h.title}</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
