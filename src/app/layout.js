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
import { ConsentedAnalytics } from "@/components/consented-analytics";
import { SITE_URL } from "@/lib/site";

// Nota: usamos la pila de fuentes del sistema (definida en globals.css)
// en lugar de next/font/google para que el proyecto compile sin depender
// de que el ordenador donde se construye tenga salida a fonts.googleapis.com
// (algunas redes corporativas o entornos con proxy la bloquean). El
// resultado visual es igual de cuidado y además carga más rápido. Si
// prefieres una tipografía de Google Fonts concreta, es un cambio de una
// línea en globals.css (--font-sans / --font-serif).

export const metadata = {
  // Todas las URLs "relativas" que genera Next (Open Graph, canonical,
  // el propio sitemap) se resuelven a partir de aquí — así, en cuanto
  // pongas NEXT_PUBLIC_SITE_URL con tu dominio propio (ver lib/site.js),
  // TODO lo que use metadata pasa a apuntar a ese dominio sin tocar nada
  // más en este archivo.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The God Supplier — Cursos y ebooks digitales al instante",
    // Las páginas que ponen su propio título (ver cada `export const
    // metadata` de src/app/**) lo insertan aquí en vez de repetir
    // "— The God Supplier" en cada una.
    template: "%s — The God Supplier",
  },
  description:
    "Tienda online de cursos y ebooks digitales: compra y descarga al momento, sin envíos ni esperas.",
  // Open Graph y Twitter Card: lo que se ve al compartir el enlace de la
  // tienda en WhatsApp, redes sociales, etc. La imagen sale sola de
  // opengraph-image.js (Next la detecta por el nombre del archivo), así
  // que no hace falta repetirla aquí.
  openGraph: {
    title: "The God Supplier — Cursos y ebooks digitales al instante",
    description:
      "Tienda online de cursos y ebooks digitales: compra y descarga al momento, sin envíos ni esperas.",
    url: SITE_URL,
    siteName: "The God Supplier",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The God Supplier — Cursos y ebooks digitales al instante",
    description:
      "Tienda online de cursos y ebooks digitales: compra y descarga al momento, sin envíos ni esperas.",
  },
  // URL "oficial" de la home, para que Google no la confunda con las
  // URLs de vista previa que genera Vercel en cada despliegue (o con
  // vercel.app y un futuro dominio propio a la vez). Cada página con su
  // propio `metadata` puede pisar esto con su propio `alternates.canonical`.
  alternates: { canonical: "/" },
  // Demuestra a Google Search Console que esta web es tuya (Next añade
  // solo la etiqueta <meta name="google-site-verification" ...> en el
  // <head>). El código sale de Search Console → Añadir propiedad →
  // Prefijo de URL → método "Etiqueta HTML" — si algún día necesitas
  // verificarla de nuevo (por ejemplo, con otra cuenta de Google), el
  // nuevo código va aquí.
  verification: {
    google: "Fs7d49yyRuliIxwQp-Lp20AwKQ9i2WE2htnuDN6B9Uw",
  },
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
          <ConsentedAnalytics />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
