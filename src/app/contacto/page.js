import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Contacto",
  description: "¿Dudas sobre un curso o un pedido? Escríbenos y te respondemos.",
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-center font-serif text-4xl">¿Hablamos?</h1>
      <ContactForm />
    </div>
  );
}
