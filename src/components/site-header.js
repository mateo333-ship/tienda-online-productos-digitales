"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { useSession } from "./session-provider";
import { Button } from "./ui/button";

const NAV = [
  { href: "/productos", label: "Catálogo" },
  { href: "/#historia", label: "Historia" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const { count } = useCart();
  const { user } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Terra&nbsp;<span className="text-[var(--ink-soft)] font-normal">Casa</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--ink-soft)] md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[var(--ink)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/carrito"
            className="relative text-sm font-medium text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
          >
            Carrito
            {count > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ink)] px-1 text-xs font-semibold text-[var(--background)]">
                {count}
              </span>
            )}
          </Link>

          {user === undefined ? null : user ? (
            <Link href="/cuenta" className="text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)]">
              Hola, {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Button href="/login" variant="outline" className="hidden sm:inline-block !px-5 !py-2 text-sm">
              Iniciar sesión
            </Button>
          )}

          <button
            className="md:hidden"
            aria-label="Abrir menú"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="block h-0.5 w-6 bg-[var(--ink)]" />
            <span className="mt-1.5 block h-0.5 w-6 bg-[var(--ink)]" />
            <span className="mt-1.5 block h-0.5 w-6 bg-[var(--ink)]" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-4 border-t border-[var(--border)] px-6 py-4 text-sm font-medium text-[var(--ink-soft)] md:hidden">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          {!user && (
            <Link href="/login" onClick={() => setOpen(false)}>
              Iniciar sesión
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
