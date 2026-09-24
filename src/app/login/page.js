import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión o crea tu cuenta en The God Supplier.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <AuthForm mode="login" next={typeof next === "string" ? next : undefined} />
    </div>
  );
}
