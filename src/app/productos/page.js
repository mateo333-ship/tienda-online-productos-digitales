import { getAllProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const metadata = { title: "Catálogo — Terra Casa" };

export default function CatalogoPage() {
  const products = getAllProducts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-serif text-4xl">Catálogo</h1>
      <p className="mt-2 max-w-lg text-[var(--ink-soft)]">
        Piezas de producción limitada. Cuando se acaban, se acaban.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
