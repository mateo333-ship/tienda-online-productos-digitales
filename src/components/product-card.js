import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-shadow hover:shadow-lg hover:shadow-black/40"
    >
      {/* Si el producto trae una foto real (`image`), se usa esa; si no
          (los productos de ejemplo todavía no tienen), se ve el degradado
          de color de siempre — así no hace falta tener foto para todo. */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--background)]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className={`h-full w-full bg-gradient-to-br ${product.accent} transition-transform duration-500 group-hover:scale-[1.03]`}
          />
        )}
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 font-medium">{product.name}</h3>
        <p className="mt-2 text-sm font-semibold">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
