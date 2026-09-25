"use client";

import { useEffect, useState } from "react";

function computeTimeLeft(endsAt) {
  const diff = endsAt - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function TimeBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-9 rounded-lg bg-[var(--accent-ink)] px-2 py-1 text-center font-mono text-lg font-bold tabular-nums text-[var(--accent)] sm:text-xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wide text-[var(--accent-ink)]/70">
        {label}
      </span>
    </div>
  );
}

/**
 * Cuenta atrás visual de la oferta de lanzamiento. `endsAt` llega ya
 * calculado desde el servidor (ver server/promo/countdown-repo.js),
 * guardado en la base de datos la primera vez que se creó — así todo el
 * mundo ve la MISMA fecha límite, y no se reinicia al recargar la página
 * ni al volver a desplegar la web.
 *
 * Deja de mostrarse ella sola en cuanto el tiempo llega a cero, sin
 * esperar a que alguien recargue la página (por si alguien la tiene
 * abierta justo en el momento en que termina la oferta).
 */
export function CountdownBanner({ endsAt, code, percent }) {
  const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(endsAt));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(computeTimeLeft(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!timeLeft) return null;

  return (
    <div className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent)] via-[#a6ffb0] to-[var(--accent)] px-4 py-3 text-[var(--accent-ink)] shadow-[0_1px_24px_-4px_var(--accent)]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
        <p className="text-center text-sm font-semibold sm:text-base">
          ⚡ Oferta de lanzamiento: <span className="font-bold">{percent}% OFF</span> con el código{" "}
          <span className="rounded bg-[var(--accent-ink)] px-1.5 py-0.5 font-mono text-[var(--accent)]">
            {code}
          </span>
        </p>
        <div
          className="flex items-center gap-1.5 sm:gap-2"
          role="timer"
          aria-live="off"
          aria-label={`Quedan ${timeLeft.days} días, ${timeLeft.hours} horas, ${timeLeft.minutes} minutos y ${timeLeft.seconds} segundos de oferta`}
        >
          <TimeBox value={timeLeft.days} label="días" />
          <span className="pb-4 font-bold" aria-hidden="true">
            :
          </span>
          <TimeBox value={timeLeft.hours} label="horas" />
          <span className="pb-4 font-bold" aria-hidden="true">
            :
          </span>
          <TimeBox value={timeLeft.minutes} label="min" />
          <span className="pb-4 font-bold" aria-hidden="true">
            :
          </span>
          <TimeBox value={timeLeft.seconds} label="seg" />
        </div>
      </div>
    </div>
  );
}
