import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Botón de la tienda. Usa el estilo "Uiverse — BHARGAVPATEL1244" (ver
 * globals.css, clase `.btn-neon`) como variante principal.
 *
 * <Button>Comprar ahora</Button>
 * <Button variant="outline">Ver más</Button>
 * <Button href="/productos">Ir al catálogo</Button>
 */
export function Button({
  children,
  variant = "solid",
  href,
  className,
  type = "button",
  ...props
}) {
  const cls = cn(variant === "solid" ? "btn-neon" : "btn-neon-outline", className);
  const content = <span>{children}</span>;

  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} {...props}>
      {content}
    </button>
  );
}
