// src/i18n/config.ts
// Configuracion base de internacionalizacion para el skill `i18n`.
// LatAm-first: es-MX por default, en-US listo para activar.
// Stack: next-intl sobre Next.js 16 App Router.

export const locales = ["es-MX", "en-US"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es-MX";

/** Etiquetas legibles para el selector de idioma. */
export const localeLabels: Record<Locale, string> = {
  "es-MX": "Espanol (Mexico)",
  "en-US": "English (US)",
};

/** Moneda por defecto por locale (para Intl.NumberFormat). */
export const localeCurrency: Record<Locale, string> = {
  "es-MX": "MXN",
  "en-US": "USD",
};

/** Formatea moneda respetando el locale. */
export function formatCurrency(amount: number, locale: Locale = defaultLocale): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: localeCurrency[locale],
  }).format(amount);
}

/** Formatea fecha respetando el locale. */
export function formatDate(date: Date | string, locale: Locale = defaultLocale): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(d);
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
