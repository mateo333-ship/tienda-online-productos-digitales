"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useCart } from "./cart-provider";
import { useSession } from "./session-provider";
import { Button } from "./ui/button";

const NAV = [
  { href: "/productos", label: "Catálogo" },
  { href: "/#historia", label: "Historia" },
  { href: "/contacto", label: "Contacto" },
];

function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function SiteHeader() {
  const { count } = useCart();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  // El menú a pantalla completa se monta con un portal directamente en
  // <body> (ver más abajo el porqué), y `document` no existe todavía en
  // el primer render del servidor, así que esperamos a estar en el
  // navegador antes de montarlo. `useSyncExternalStore` (en vez de un
  // `useState` + `useEffect`) es la forma que recomienda React para leer
  // "¿ya estamos en el cliente?" sin provocar un re-render en cascada.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Mientras el menú está abierto, bloqueamos el scroll de la página de
  // detrás y permitimos cerrarlo con Escape, como en cualquier menú a
  // pantalla completa cuidado.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const MENU_ITEMS = [...NAV, { href: "/carrito", label: "Carrito", badge: count > 0 ? count : null }];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        {/* `shrink-0` + `whitespace-nowrap`: sin esto, en pantallas muy
            estrechas el logo se parte en dos líneas al competir por
            espacio con el carrito y el menú, y queda todo apretado. */}
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap text-base font-semibold tracking-tight sm:text-lg"
          onClick={() => setOpen(false)}
        >
          The God&nbsp;<span className="text-[var(--ink-soft)] font-normal">Supplier</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--ink-soft)] md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[var(--ink)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Link
            href="/carrito"
            className="relative shrink-0 text-sm font-medium text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
          >
            Carrito
            {count > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ink)] px-1 text-xs font-semibold text-[var(--background)]">
                {count}
              </span>
            )}
          </Link>

          {/* El saludo "Hola, Nombre" solo cabe cómodo a partir de `sm`;
              en móvil vive dentro de la tarjeta de cuenta del menú de
              abajo, para que la cabecera no se apriete. */}
          {user === undefined ? null : user ? (
            <Link
              href="/cuenta"
              className="hidden text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] sm:inline-block"
            >
              Hola, {user.name.split(" ")[0]}
            </Link>
          ) : (
            // Envuelto en un `<div>` con `hidden sm:block`, en vez de poner
            // esas clases en el propio Button: el estilo `.btn-neon-outline`
            // (plantilla Uiverse, con sus valores originales sin tocar) fija
            // `display: inline-block` con una regla CSS normal, que en
            // Tailwind v4 siempre gana a las utilidades como `hidden` estén
            // en el propio elemento. Ocultando el contenedor en su lugar,
            // el botón se sigue ocultando de verdad en móvil (si no, se
            // quedaba visible y desbordaba la cabecera en pantallas
            // estrechas para quien no había iniciado sesión).
            <div className="hidden sm:block">
              <Button href="/login" variant="outline" className="!px-5 !py-2 text-sm">
                Iniciar sesión
              </Button>
            </div>
          )}

          {/* Botón hamburguesa → X: son las mismas tres líneas, que giran
              y se abren formando una cruz con una transición CSS al abrir
              el menú, en vez de cambiar de icono de golpe. */}
          <button
            className="relative flex h-9 w-9 shrink-0 items-center justify-center md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span
              className={`absolute h-0.5 w-6 bg-[var(--ink)] transition duration-300 ${
                open ? "rotate-45" : "-translate-y-2"
              }`}
            />
            <span
              className={`absolute h-0.5 w-6 bg-[var(--ink)] transition duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-0.5 w-6 bg-[var(--ink)] transition duration-300 ${
                open ? "-rotate-45" : "translate-y-2"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Menú móvil a pantalla completa, montado con un portal en <body>
          en vez de aquí dentro: la cabecera usa `backdrop-blur`
          (backdrop-filter), y cualquier `backdrop-filter` / `filter` /
          `transform` en un antecesor lo convierte en el "contenedor" de
          sus descendientes `fixed` — dentro de la cabecera, el menú
          quedaba encogido a la altura de la propia cabecera en vez de
          cubrir la pantalla entera. Con el portal, ese problema
          desaparece sin tener que tocar el estilo de la cabecera.
          Se queda siempre montado (mejor para animar la entrada y la
          salida) pero invisible e inactivo mientras `open` es false. */}
      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 flex flex-col bg-[var(--background)] transition-opacity duration-300 md:hidden ${
              open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            role="dialog"
            aria-modal="true"
            aria-hidden={!open}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4 sm:px-6">
              <Link
                href="/"
                className="shrink-0 whitespace-nowrap text-base font-semibold tracking-tight"
                onClick={() => setOpen(false)}
              >
                The God&nbsp;<span className="text-[var(--ink-soft)] font-normal">Supplier</span>
              </Link>
              <button
                className="flex h-9 w-9 shrink-0 items-center justify-center"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
              >
                <CloseIcon className="h-6 w-6 text-[var(--ink)]" />
              </button>
            </div>

            <div
              className={`flex flex-1 flex-col overflow-y-auto px-6 pb-10 pt-6 transition-transform duration-300 ${
                open ? "translate-y-0" : "-translate-y-4"
              }`}
            >
              <nav className="flex flex-col">
                {MENU_ITEMS.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between gap-4 border-b border-[var(--border)] py-6 active:bg-[var(--surface)]"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="font-serif text-sm text-[var(--accent)]">0{i + 1}</span>
                      <span className="font-serif text-4xl leading-none text-[var(--ink)] transition group-active:text-[var(--accent)]">
                        {item.label}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {item.badge && (
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-sm font-semibold text-[var(--accent-ink)]">
                          {item.badge}
                        </span>
                      )}
                      <ArrowIcon className="h-6 w-6 shrink-0 text-[var(--ink-soft)] transition group-active:translate-x-1 group-active:text-[var(--accent)]" />
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Cuenta / inicio de sesión, destacado aparte al fondo del
                  menú, en vez de mezclado como un enlace más de la lista. */}
              <div className="mt-auto pt-10">
                {user === undefined ? null : user ? (
                  <Link
                    href="/cuenta"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 transition active:border-[var(--accent)]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]">
                      <UserIcon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm text-[var(--ink-soft)]">Hola, {user.name.split(" ")[0]}</span>
                      <span className="block text-base font-medium text-[var(--ink)]">Ir a mi cuenta</span>
                    </span>
                    <ArrowIcon className="ml-auto h-5 w-5 shrink-0 text-[var(--ink-soft)]" />
                  </Link>
                ) : (
                  <Button
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-center !py-4 text-base"
                  >
                    Iniciar sesión
                  </Button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
