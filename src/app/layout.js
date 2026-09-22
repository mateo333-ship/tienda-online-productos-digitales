import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { LoadingProvider } from "@/components/loading-overlay";
import { SessionProvider } from "@/components/session-provider";
import { PromoBanner } from "@/components/promo-banner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieConsentProvider } from "@/components/cookie-consent-provider";
import { CookieBanner } from "@/components/cookie-banner";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { CookiePreferencesModal } from "@/components/cookie-preferences-modal";

// Nota: usamos la pila de fuentes del sistema (definida en globals.css)
// en lugar de next/font/google para que el proyecto compile sin depender
// de que el ordenador donde se construye tenga salida a fonts.googleapis.com
// (algunas redes corporativas o entornos con proxy la bloquean). El
// resultado visual es igual de cuidado y además carga más rápido. Si
// prefieres una tipografía de Google Fonts concreta, es un cambio de una
// línea en globals.css (--font-sans / --font-serif).

export const metadata = {
  title: "The God Supplier — Cursos y ebooks digitales al instante",
  description:
    "Tienda online de cursos y ebooks digitales: compra y descarga al momento, sin envíos ni esperas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {/* El consentimiento de cookies envuelve todo lo demás: es
            independiente de la sesión y del carrito, y tanto el aviso
            inicial como el botón flotante y su panel deben poder verse
            en cualquier página, esté o no la persona conectada. */}
        <CookieConsentProvider>
          <LoadingProvider>
            <SessionProvider>
              <CartProvider>
                <PromoBanner />
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </CartProvider>
            </SessionProvider>
          </LoadingProvider>
          <CookieBanner />
          <CookieSettingsButton />
          <CookiePreferencesModal />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
