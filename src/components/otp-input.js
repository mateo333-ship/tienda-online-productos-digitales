"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Campo de código de verificación por casillas, estilo "shadcn / rare-ui
 * otp-input" (swamimalode07/rare-ui). En el entorno donde se ha construido
 * este proyecto no había salida a internet hacia el registro de
 * componentes de shadcn (`ui.shadcn.com` estaba bloqueado por la
 * configuración de red), así que este componente está hecho a mano
 * siguiendo la misma idea: casillas individuales, foco automático,
 * navegación con flechas/backspace y pegado de un código completo de una
 * vez. Si en tu propio ordenador tienes shadcn configurado, puedes
 * sustituirlo por el original ejecutando:
 *
 *   npx shadcn@latest add swamimalode07/rare-ui/otp-input
 *
 * y usando ese componente con la misma prop `value`/`onChange`.
 */
export function OtpInput({ length = 6, value, onChange, disabled, autoFocus = true }) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setDigitAt(index, char) {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join(""));
  }

  function handleChange(index, e) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigitAt(index, "");
      return;
    }
    if (raw.length > 1) {
      // El usuario ha pegado varios dígitos dentro de una sola casilla.
      const chars = raw.split("").slice(0, length - index);
      const next = digits.slice();
      chars.forEach((c, i) => (next[index + i] = c));
      onChange(next.join(""));
      const lastIndex = Math.min(index + chars.length, length - 1);
      inputsRef.current[lastIndex]?.focus();
      return;
    }
    setDigitAt(index, raw);
    if (index < length - 1) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigitAt(index, "");
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setDigitAt(index - 1, "");
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e) {
    const raw = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!raw) return;
    e.preventDefault();
    onChange(raw);
    const lastIndex = Math.min(raw.length, length - 1);
    inputsRef.current[lastIndex]?.focus();
  }

  return (
    <div className="flex items-center justify-center gap-2" role="group" aria-label="Código de verificación">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          pattern="\d*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "h-12 w-10 rounded-lg border text-center text-lg font-semibold outline-none transition-all",
            "bg-white border-[var(--border)] text-[var(--ink)]",
            "focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--accent)]",
            digit && "border-[var(--ink)]"
          )}
        />
      ))}
    </div>
  );
}
