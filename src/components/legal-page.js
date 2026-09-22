import Link from "next/link";

/**
 * Maquetación compartida por las 4 páginas legales (cookies, privacidad,
 * términos y condiciones, envíos y pagos), para que las cuatro se vean
 * como parte de la misma web y no haya que repetir el mismo `<div>` con
 * los mismos anchos y tipografías cuatro veces.
 */
export function LegalPage({ title, updated, intro, children }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">Información legal</p>
      <h1 className="mt-2 font-serif text-4xl">{title}</h1>
      <p className="mt-3 text-xs text-[var(--ink-soft)]">Última actualización: {updated}</p>
      {intro && <p className="mt-6 leading-relaxed text-[var(--ink-soft)]">{intro}</p>}
      <div className="mt-10 space-y-10">{children}</div>

      <div className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border)] pt-8 text-sm">
        <LegalNavLink href="/terminos">Términos y condiciones</LegalNavLink>
        <LegalNavLink href="/privacidad">Política de privacidad</LegalNavLink>
        <LegalNavLink href="/cookies">Política de cookies</LegalNavLink>
        <LegalNavLink href="/envios-pagos">Entrega y pagos</LegalNavLink>
      </div>
    </div>
  );
}

function LegalNavLink({ href, children }) {
  return (
    <Link href={href} className="text-[var(--ink-soft)] underline hover:text-[var(--ink)]">
      {children}
    </Link>
  );
}

export function LegalSection({ heading, children }) {
  return (
    <section>
      <h2 className="font-serif text-xl">{heading}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--ink-soft)]">{children}</div>
    </section>
  );
}
