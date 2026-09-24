import { Suspense } from "react";
import { VerificarForm } from "./verificar-form";

export const metadata = {
  title: "Verifica tu email",
  description: "Introduce el código que te hemos enviado para verificar tu cuenta.",
  robots: { index: false, follow: false },
};

export default function VerificarPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <Suspense fallback={null}>
        <VerificarForm />
      </Suspense>
    </div>
  );
}
