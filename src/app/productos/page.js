import { getAllProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const metadata = {
  title: "Catálogo",
  description: "Todos los cursos y ebooks digitales de The God Supplier, en un único catálogo.",
};

export default function CatalogoPage() {
  const products = getAllProducts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-serif text-4xl">Catálogo</h1>
      <p className="mt-2 max-w-lg text-[var(--ink-soft)]">
        Cursos y ebooks digitales. Compra y accede al instante, sin esperas.
      </p>

      {/* Un único recordatorio del código, compacto y en el mismo sitio
          donde se decide qué comprar — no un banner grande, para no
          repetir el mismo aviso llamativo del todo de la página. */}
      <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-2 text-sm">
        ✨ Código <strong className="font-semibold">DIGITAL10</strong> — 10% de descuento en tu
        primer pedido
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
