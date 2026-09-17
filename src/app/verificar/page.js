import { Suspense } from "react";
import { VerificarForm } from "./verificar-form";

export const metadata = { title: "Verifica tu email — The God Supplier" };

export default function VerificarPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <Suspense fallback={null}>
        <VerificarForm />
      </Suspense>
    </div>
  );
}
