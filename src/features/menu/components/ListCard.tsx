import { Icon } from "@/shared/icons";
import type { Locale } from "@/shared/i18n";
import type { MenuProduct } from "../types";
import type { MenuStrings } from "../data/strings";
import { formatPrice, localized } from "../lib/i18n";

interface ListCardProps {
  product: MenuProduct;
  locale: Locale;
  strings: MenuStrings;
  onSelect: (product: MenuProduct) => void;
  featured?: boolean;
}

export function ListCard({ product, locale, strings, onSelect, featured = false }: ListCardProps) {
  const price = product.price === null ? strings.priceOnRequest : formatPrice(product.price, locale);
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className={`group flex min-h-24 w-full items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-white p-4 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${featured ? "sm:min-h-32 sm:p-5" : ""}`}
      aria-label={`${localized(product.name, locale)}${product.inStock ? "" : `, ${strings.soldOut}`}`}
    >
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-navy">{localized(product.name, locale)}</span>
          {product.isNew && <span className="rounded-full bg-yellow/70 px-2 py-0.5 text-caption font-bold text-navy">{strings.newLabel}</span>}
          {!product.inStock && <span className="rounded-full bg-navy/5 px-2 py-0.5 text-caption font-bold text-navy/55">{strings.soldOut}</span>}
        </span>
        {localized(product.description, locale) && (
          <span className="mt-1 block line-clamp-2 text-small text-navy/65">{localized(product.description, locale)}</span>
        )}
        <span className="mt-3 block text-small font-bold text-navy">{price}</span>
      </span>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-navy transition group-hover:bg-yellow">
        <Icon name="arrow" className="size-4 rtl:-scale-x-100" />
      </span>
    </button>
  );
}
