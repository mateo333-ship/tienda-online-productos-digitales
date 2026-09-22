import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-lg font-semibold tracking-tight">The God Supplier</p>
          <p className="mt-3 max-w-xs text-sm text-[var(--ink-soft)]">
            Cursos y ebooks digitales para aprender a tu ritmo. Compra y descarga al instante.
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
            <li><Link href="/envios-pagos" className="hover:text-[var(--ink)]">Entrega y pagos</Link></li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="font-medium text-[var(--ink)]">Legal</p>
          <ul className="mt-3 space-y-2 text-[var(--ink-soft)]">
            <li><Link href="/terminos" className="hover:text-[var(--ink)]">Términos y condiciones</Link></li>
            <li><Link href="/privacidad" className="hover:text-[var(--ink)]">Política de privacidad</Link></li>
            <li><Link href="/cookies" className="hover:text-[var(--ink)]">Política de cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-6 py-6 text-center text-xs text-[var(--ink-soft)]">
        © {new Date().getFullYear()} The God Supplier. Todos los derechos reservados.
      </div>
    </footer>
  );
}
