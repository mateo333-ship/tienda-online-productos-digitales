import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind evitando conflictos. Utilidad estándar
 * usada por los componentes de estilo "shadcn".
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents, currency = "EUR") {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
