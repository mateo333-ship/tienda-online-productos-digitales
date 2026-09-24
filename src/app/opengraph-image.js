import { ImageResponse } from "next/og";

// Imagen que se ve al compartir un enlace de la tienda en WhatsApp, redes
// sociales o cualquier chat (Open Graph). Se genera en el momento a
// partir de código —sin depender de subir un archivo de diseño— y usa
// los mismos colores que el resto de la web (ver globals.css) para que
// se note que es la misma marca. Al no llevar `slug` en la ruta, esta
// imagen es la que sale para la home y como valor por defecto en
// cualquier página que no tenga la suya propia (ver más abajo).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#1e1e1e",
          color: "#fbfef9",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 32,
            fontWeight: 600,
            color: "#66ff66",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          The God Supplier
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, marginTop: 24, maxWidth: 900 }}>
          Cursos y ebooks digitales al instante
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#9a9a9a", marginTop: 28 }}>
          Compra y descarga al momento, sin envíos ni esperas.
        </div>
      </div>
    ),
    { ...size }
  );
}
