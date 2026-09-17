import "server-only";

import { NextResponse } from "next/server";

/**
 * Envuelve un Route Handler para que, si algo inesperado lanza una
 * excepción (por ejemplo, falta una variable de entorno, o Redis no
 * responde), el cliente reciba siempre una respuesta JSON con un
 * mensaje entendible en lugar de una página de error HTML vacía.
 *
 * Sin esto, un error así provoca en el navegador algo como:
 *   "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
 * porque el `fetch(...).then(r => r.json())` del cliente intenta leer
 * JSON de una respuesta que no lo es. Con esto, siempre hay JSON que
 * leer, y además el error real queda en los logs del servidor (visibles
 * en el panel de Vercel → tu proyecto → Logs) para poder diagnosticarlo.
 */
export function safeRoute(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error("[API error]", err);
      return NextResponse.json(
        { error: "Ha ocurrido un error inesperado en el servidor. Inténtalo de nuevo." },
        { status: 500 }
      );
    }
  };
}
