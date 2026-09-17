"use client";

import { useRouter } from "next/navigation";
import { useLoading } from "@/components/loading-overlay";
import { useSession } from "@/components/session-provider";

export function LogoutButton() {
  const router = useRouter();
  const { withLoading } = useLoading();
  const { setUser } = useSession();

  return (
    <button
      onClick={() =>
        withLoading(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          setUser(null);
          router.push("/");
          router.refresh();
        })
      }
      className="text-sm font-medium text-[var(--ink-soft)] underline hover:text-[var(--ink)]"
    >
      Cerrar sesión
    </button>
  );
}
