export const metadata = {
  title: "Contacto",
  description: "¿Dudas sobre un curso o un pedido? Escríbenos y te respondemos.",
  alternates: { canonical: "/contacto" },
};

// Antes había aquí un formulario (ver git history / ContactForm), pero
// solo guardaba el mensaje en un fichero interno que nadie llegaba a
// leer ni recibía nunca un aviso por email — los mensajes se perdían sin
// que ni el cliente ni la tienda se enterasen. Un enlace directo al
// correo es mucho más fiable: el cliente escribe desde su propio gestor
// de correo y la respuesta le llega tal cual, sin depender de nada más.
const CONTACT_EMAIL = "thegodsupplier@gmail.com";

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="font-serif text-4xl">¿Hablamos?</h1>
      <p className="mt-4 text-[var(--ink-soft)]">
        ¿Dudas sobre un curso o un pedido? Escríbenos directamente y te respondemos lo antes
        posible.
      </p>
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="mt-8 inline-block rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-8 py-5 text-lg font-medium transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {CONTACT_EMAIL}
      </a>
    </div>
  );
}
