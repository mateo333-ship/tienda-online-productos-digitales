import { Button } from "@/components/ui/button";

// Página 404 propia: sin esto, Next enseña su página por defecto —fondo
// blanco, letra negra— que rompe totalmente el tema oscuro del resto de
// la web en cuanto alguien escribe mal una URL o sigue un enlace roto.
export const metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 px-6 py-24 text-left sm:py-32">
      <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-soft)]">
        Error 404
      </span>
      <h1 className="font-serif text-4xl sm:text-5xl">Esta página no existe</h1>
      <p className="max-w-md text-[var(--ink-soft)]">
        Puede que el enlace esté mal escrito o que la página se haya movido. Prueba a volver al
        catálogo o a la portada.
      </p>
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Button href="/productos">Ver catálogo</Button>
        <Button href="/" variant="outline">
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
