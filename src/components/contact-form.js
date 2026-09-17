"use client";

import { useState } from "react";

/**
 * Formulario de contacto. Maquetación: "Uiverse.io by themrsami",
 * con la lógica de envío añadida.
 */
export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se ha podido enviar el mensaje.");
      setStatus("done");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div className="container px-4 mx-auto">
      <div className="mx-auto">
        <div className="max-w-md mx-auto px-8 py-6 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-[var(--ink)] mb-4">Contacta con nosotros</h2>

          {status === "done" ? (
            <p className="text-sm text-emerald-400">
              ¡Gracias! Hemos recibido tu mensaje y te responderemos por email.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-[var(--ink-soft)] mb-1" htmlFor="name">
                  Tu nombre
                </label>
                <input
                  className="w-full px-4 py-2 bg-[var(--surface-2)] text-[var(--ink)] placeholder-[var(--ink-soft)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition duration-300"
                  placeholder="Escribe tu nombre"
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={form.name}
                  onChange={update("name")}
                />
              </div>
              <div className="mb-4">
                <label className="block text-[var(--ink-soft)] mb-1" htmlFor="email">
                  Tu email
                </label>
                <input
                  className="w-full px-4 py-2 bg-[var(--surface-2)] text-[var(--ink)] placeholder-[var(--ink-soft)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition duration-300"
                  placeholder="tu@email.com"
                  name="email"
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                />
              </div>
              <div className="mb-4">
                <label className="block text-[var(--ink-soft)] mb-1" htmlFor="message">
                  Tu mensaje
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-[var(--surface-2)] text-[var(--ink)] placeholder-[var(--ink-soft)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition duration-300"
                  rows="4"
                  placeholder="Cuéntanos en qué podemos ayudarte"
                  name="message"
                  id="message"
                  required
                  value={form.message}
                  onChange={update("message")}
                />
              </div>

              {error && <p className="mb-4 text-sm text-rose-400">{error}</p>}

              <button
                className="w-full bg-[var(--accent)] text-[var(--accent-ink)] py-2 px-4 rounded-lg hover:brightness-110 transition duration-300 font-medium"
                type="submit"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Enviando…" : "Enviar mensaje"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
