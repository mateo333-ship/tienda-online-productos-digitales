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
  return { title: product ? `${product.name} — The God Supplier` : "Producto no encontrado" };
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

        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">
            {product.category}
          </p>
          <h1 className="mt-2 font-serif text-4xl">{product.name}</h1>
          <p className="mt-4 text-xl font-semibold">{formatPrice(product.price)}</p>
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
            <AddToCartButton product={product} />
          </div>
          <p className="mt-3 text-xs text-[var(--ink-soft)]">
            📩 Acceso inmediato: al ser un producto 100% digital, lo recibes al instante tras la
            compra.
          </p>
        </div>
      </div>

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
