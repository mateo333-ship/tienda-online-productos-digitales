const MESSAGE = "Código DIGITAL10 — 10% de descuento en tu primer pedido";

// Repetimos el mensaje varias veces para que la cinta nunca se quede
// "vacía" a mitad de pantalla en monitores anchos, y duplicamos todo el
// bloque para poder animar de 0% a -50% en bucle sin que se note el corte.
const REPEATS = Array.from({ length: 6 });

export function PromoBanner() {
  return (
    <div className="overflow-hidden border-b border-[var(--border)] bg-[var(--ink)] py-2 text-[var(--background)]">
      <div className="flex w-max motion-safe:animate-[promo-marquee_22s_linear_infinite]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {REPEATS.map((_, i) => (
              <span
                key={i}
                className="mx-6 whitespace-nowrap text-xs font-medium uppercase tracking-wide"
              >
                ✨ {MESSAGE} ✨
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
