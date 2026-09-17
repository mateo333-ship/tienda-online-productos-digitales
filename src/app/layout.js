import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { LoadingProvider } from "@/components/loading-overlay";
import { SessionProvider } from "@/components/session-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Nota: usamos la pila de fuentes del sistema (definida en globals.css)
// en lugar de next/font/google para que el proyecto compile sin depender
// de que el ordenador donde se construye tenga salida a fonts.googleapis.com
// (algunas redes corporativas o entornos con proxy la bloquean). El
// resultado visual es igual de cuidado y además carga más rápido. Si
// prefieres una tipografía de Google Fonts concreta, es un cambio de una
// línea en globals.css (--font-sans / --font-serif).

export const metadata = {
  title: "The God Supplier — Objetos sencillos para el hogar",
  description:
    "Tienda online de objetos de casa hechos con cuidado: velas, cerámica, textil y aromas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <LoadingProvider>
          <SessionProvider>
            <CartProvider>
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </CartProvider>
          </SessionProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
