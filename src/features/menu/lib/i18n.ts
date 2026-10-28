import type { Locale } from "@/shared/i18n";
import type { L10n } from "../types";

export function localized(value: L10n | null | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale]?.trim() || value[locale === "ar" ? "en" : "ar"]?.trim() || "";
}

export function formatPrice(value: number | null, locale: Locale): string | null {
  if (value === null || !Number.isFinite(value)) return null;
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value);
}
