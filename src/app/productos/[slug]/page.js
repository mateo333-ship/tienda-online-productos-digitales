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
  return { title: product ? `${product.name} — Terra Casa` : "Producto no encontrado" };
}

export default async function ProductoPage({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className={`aspect-square rounded-3xl bg-[var(--surface)] bg-gradient-to-br ${product.accent}`} />

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
        </div>
      </div>
    </div>
  );
}
