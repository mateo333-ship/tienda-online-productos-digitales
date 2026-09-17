import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts } from "@/lib/products";

const STEPS = [
  {
    n: "01",
    title: "Eliges tus piezas",
    text: "Explora un catálogo pequeño y cuidado: cada objeto está pensado para durar, no para acumularse.",
  },
  {
    n: "02",
    title: "Creas tu cuenta",
    text: "Registro con verificación por email y sesión protegida, para que tus pedidos siempre estén donde los dejaste.",
  },
  {
    n: "03",
    title: "Llega a casa",
    text: "Preparamos cada pedido a mano y te avisamos en cada paso, desde tu perfil de cliente.",
  },
];

const TESTIMONIALS = [
  {
    quote: "La vela ámbar huele exactamente como esperaba, algo raro comprando online.",
    name: "Marta G.",
  },
  {
    quote: "Pedí la manta de lana y ya voy por la segunda. Se nota que está bien hecha.",
    name: "Iñaki R.",
  },
  {
    quote: "El proceso de compra fue rapidísimo y el envío llegó antes de lo previsto.",
    name: "Clara M.",
  },
];

export default function HomePage() {
  const featured = getFeaturedProducts(3);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 pb-20 pt-16 sm:pt-24">
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">
          Nueva colección de otoño
        </span>
        <h1 className="max-w-2xl font-serif text-5xl leading-tight sm:text-6xl">
          Objetos sencillos, hechos para quedarse.
        </h1>
        <p className="max-w-xl text-lg text-[var(--ink-soft)]">
          The God Supplier reúne velas, cerámica y textil de pequeños talleres, para una casa con
          menos ruido y más carácter.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button href="/productos">Ver catálogo</Button>
          <Button href="#historia" variant="outline">
            Nuestra historia
          </Button>
        </div>
      </section>

      {/* Producto destacado */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-3xl">Lo más querido</h2>
          <Link href="/productos" className="text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)]">
            Ver todo →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="historia" className="border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="mb-12 max-w-lg font-serif text-3xl">
            Una tienda pequeña, pensada para que confíes en ella.
          </h2>
          <div className="grid gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <p className="font-serif text-4xl text-[var(--ink-soft)]">{step.n}</p>
                <h3 className="mt-3 font-medium">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 font-serif text-3xl">Lo que cuentan</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <blockquote className="text-sm text-[var(--ink-soft)]">“{t.quote}”</blockquote>
              <figcaption className="mt-4 text-sm font-medium">{t.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-[var(--ink)] px-8 py-14 text-[var(--background)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl">Crea tu cuenta y guarda tus pedidos</h2>
            <p className="mt-2 max-w-md text-sm text-[var(--background)]/70">
              Registro con código de verificación por email y sesión protegida.
            </p>
          </div>
          <Button href="/login">Crear cuenta</Button>
        </div>
      </section>
    </div>
  );
}
