import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition-shadow hover:shadow-lg"
    >
      <div className={`aspect-[4/5] bg-gradient-to-br ${product.accent} transition-transform duration-500 group-hover:scale-[1.03]`} />
      <div className="p-5">
        <p className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">{product.category}</p>
        <h3 className="mt-1 font-medium">{product.name}</h3>
        <p className="mt-2 text-sm font-semibold">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
