"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="text-sm font-medium text-[var(--ink-soft)] underline hover:text-[var(--ink)]"
    >
      Cerrar sesión
    </button>
  );
}
