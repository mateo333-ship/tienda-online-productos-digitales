"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";

export function AddToCartButton({ product }) {
  const { addItem, loggedIn } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  return (
    <div>
      <Button
        onClick={() => {
          const ok = addItem(product, 1);
          if (!ok) {
            // Sin cuenta no se puede añadir nada al carrito: avisamos y
            // mandamos directos al formulario de inicio de sesión.
            setNeedsLogin(true);
            router.push(`/login?next=/productos/${product.slug}`);
            return;
          }
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
      >
        {added ? "Añadido ✓" : "Añadir al carrito"}
      </Button>
      {!loggedIn && needsLogin && (
        <p className="mt-2 text-sm text-rose-400">
          Necesitas una cuenta para añadir productos al carrito. Te llevamos a iniciar sesión…
        </p>
      )}
    </div>
  );
}
