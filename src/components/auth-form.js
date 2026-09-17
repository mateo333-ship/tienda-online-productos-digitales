"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Formulario de inicio de sesión / registro.
 * Maquetación: "Uiverse.io by Yaya12085" (ver .form-container y clases
 * relacionadas en globals.css), con la lógica de peticiones al servidor
 * añadida encima.
 */
export function AuthForm({ mode = "login" }) {
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se ha podido completar el registro.");

        const params = new URLSearchParams({ email: form.email });
        if (data.devCode) params.set("devCode", data.devCode);
        router.push(`/verificar?${params.toString()}`);
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se ha podido iniciar sesión.");
      router.push("/cuenta");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <p className="title">{isRegister ? "Crear cuenta" : "Bienvenido de nuevo"}</p>
      <form className="form" onSubmit={handleSubmit}>
        {isRegister && (
          <div className="input-group">
            <label htmlFor="name">Nombre</label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={update("name")}
              placeholder="Tu nombre"
            />
          </div>
        )}

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            placeholder="tu@email.com"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            minLength={isRegister ? 8 : undefined}
            value={form.password}
            onChange={update("password")}
            placeholder={isRegister ? "Mínimo 8 caracteres" : "••••••••"}
          />
        </div>

        {!isRegister && (
          <div className="forgot">
            <label>
              <input type="checkbox" className="mr-1 align-middle" /> Recuérdame
            </label>
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-rose-400" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="sign mt-5" disabled={loading}>
          {loading ? "Un momento…" : isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </button>
      </form>

      <p className="signup mt-4">
        {isRegister ? "¿Ya tienes cuenta? " : "¿No tienes cuenta todavía? "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setError("");
            setIsRegister((v) => !v);
          }}
        >
          {isRegister ? "Inicia sesión" : "Regístrate"}
        </a>
      </p>

      <p className="mt-3 text-center text-xs text-[var(--ink-soft)]">
        <Link href="/" className="hover:underline">
          Volver a la tienda
        </Link>
      </p>
    </div>
  );
}
