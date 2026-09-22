import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts } from "@/lib/products";
import { getCurrentUser } from "@/server/auth/current-user";

const STEPS = [
  {
    n: "01",
    title: "Eliges tu curso",
    text: "Explora un catálogo pequeño y cuidado: cada ebook o curso está pensado para aprender de verdad, no para acumular sin abrir.",
  },
  {
    n: "02",
    title: "Creas tu cuenta",
    text: "Registro con verificación por email y sesión protegida, para que tus compras siempre estén donde los dejaste.",
  },
  {
    n: "03",
    title: "Descarga al instante",
    text: "En cuanto se confirma el pedido, tu ebook o curso está disponible en tu cuenta al momento — sin envíos ni esperas.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Pagué y en un minuto ya tenía el ebook en mi cuenta, sin esperar ningún email.",
    name: "Marta G.",
  },
  {
    quote: "El curso está mejor explicado que otros que pagué el doble de caro.",
    name: "Iñaki R.",
  },
  {
    quote: "Pude descargarlo al momento y ponerme a estudiar esa misma noche.",
    name: "Clara M.",
  },
];

export default async function HomePage() {
  const featured = getFeaturedProducts(3);
  // Se comprueba en el propio servidor (con la cookie de sesión, nunca
  // con algo que decida el navegador) para que el CTA de "Crea tu
  // cuenta" ni siquiera llegue a aparecer un instante si ya has
  // iniciado sesión — no tendría sentido pedirte crear una cuenta que
  // ya tienes.
  const user = await getCurrentUser();

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 pb-20 pt-16 sm:pt-24">
        <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">
          Cursos y ebooks digitales
        </span>
        <h1 className="max-w-2xl font-serif text-5xl leading-tight sm:text-6xl">
          Aprende hoy, no la semana que viene.
        </h1>
        <p className="max-w-xl text-lg text-[var(--ink-soft)]">
          The God Supplier reúne cursos y ebooks digitales pensados para aprender de verdad:
          pagas y descargas al momento, sin envíos ni esperas.
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

      {/* CTA final: solo tiene sentido para quien todavía no tiene
          cuenta — si ya has iniciado sesión, no se muestra. */}
      {!user && (
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
      )}
    </div>
  );
}
