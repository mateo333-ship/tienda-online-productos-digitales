/**
 * Datos del titular de la tienda, usados en todas las páginas legales
 * (política de privacidad, cookies, términos y condiciones, envíos y
 * pagos). Es el mismo patrón que `lib/products.js`: un único sitio para
 * cambiar algo que se usa en varias páginas a la vez.
 *
 * ⚠️ IMPORTANTE — RELLENA ESTO CON TUS DATOS REALES ANTES DE PUBLICAR:
 * en España es obligatorio identificar al titular de cualquier tienda
 * online (art. 10 LSSI-CE) y al responsable del tratamiento de datos
 * (RGPD). Los textos legales de esta web ya están listos, pero con estos
 * campos sin rellenar identifican a un titular que no existe — es mejor
 * no publicar la tienda hasta tenerlos completos. Si vendes como
 * autónomo, `ownerName` es tu nombre y apellidos; si tienes una sociedad,
 * es la razón social.
 */
export const LEGAL_INFO = {
  ownerName: "[NOMBRE Y APELLIDOS O RAZÓN SOCIAL]",
  taxId: "[NIF / CIF]",
  address: "[DIRECCIÓN FISCAL COMPLETA — calle, número, código postal, ciudad, provincia]",
  email: "[EMAIL DE CONTACTO]",
  siteName: "The God Supplier",
  country: "España",
};
