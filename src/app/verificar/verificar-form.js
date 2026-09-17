"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OtpInput } from "@/components/otp-input";
import { Button } from "@/components/ui/button";

export function VerificarForm() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") ?? "";
  const devCode = params.get("devCode");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Código incorrecto.");
      router.push("/cuenta");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <h1 className="font-serif text-2xl">Revisa tu email</h1>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        Hemos enviado un código de 6 dígitos a <strong>{email}</strong>.
      </p>

      {devCode && (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          Modo demo (sin proveedor de email conectado todavía): tu código es{" "}
          <strong>{devCode}</strong>.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <OtpInput value={code} onChange={setCode} />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <Button type="submit" disabled={code.length !== 6 || loading} className="w-full">
          {loading ? "Comprobando…" : "Verificar"}
        </Button>
      </form>
    </div>
  );
}
