import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-3">
        <div>
          <p className="text-lg font-semibold tracking-tight">Terra Casa</p>
          <p className="mt-3 max-w-xs text-sm text-[var(--ink-soft)]">
            Objetos sencillos para una casa en calma. Hechos con cuidado, pensados para durar.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-medium text-[var(--ink)]">Tienda</p>
          <ul className="mt-3 space-y-2 text-[var(--ink-soft)]">
            <li><Link href="/productos" className="hover:text-[var(--ink)]">Catálogo</Link></li>
            <li><Link href="/cuenta" className="hover:text-[var(--ink)]">Mi cuenta</Link></li>
            <li><Link href="/carrito" className="hover:text-[var(--ink)]">Carrito</Link></li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-medium text-[var(--ink)]">Ayuda</p>
          <ul className="mt-3 space-y-2 text-[var(--ink-soft)]">
            <li><Link href="/contacto" className="hover:text-[var(--ink)]">Contacto</Link></li>
            <li><Link href="/login" className="hover:text-[var(--ink)]">Iniciar sesión</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-6 py-6 text-center text-xs text-[var(--ink-soft)]">
        © {new Date().getFullYear()} Terra Casa. Todos los derechos reservados.
      </div>
    </footer>
  );
}
