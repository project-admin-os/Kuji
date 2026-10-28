import type { Locale } from "@/shared/i18n";
import type { MenuPairing, MenuProduct } from "../types";
import type { MenuStrings } from "../data/strings";
import { formatPrice, localized } from "../lib/i18n";

interface OfferCardProps {
  pairing: MenuPairing;
  products: [MenuProduct, MenuProduct];
  locale: Locale;
  strings: MenuStrings;
  onSelect: () => void;
}

export function OfferCard({ pairing, products, locale, strings, onSelect }: OfferCardProps) {
  const names = products.map((product) => localized(product.name, locale));
  const title = localized(pairing.title, locale) || names.join(" + ");
  const price = pairing.price === null ? strings.priceOnRequest : formatPrice(pairing.price, locale);
  return (
    <button type="button" onClick={onSelect} className="flex min-h-44 w-full flex-col justify-between rounded-2xl bg-yellow p-5 text-start text-navy shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy sm:min-h-52 sm:p-6">
      <span>
        <span className="text-caption font-bold uppercase tracking-[0.16em]">{strings.openOffer}</span>
        <span className="mt-3 block text-heading font-bold">{title}</span>
        <span className="mt-2 block text-small text-navy/70">{names.join(" · ")}</span>
      </span>
      <span className="mt-6 flex items-center justify-between gap-4">
        <span className="font-bold">{price}</span>
        <span className="grid size-10 place-items-center rounded-full bg-navy text-yellow" aria-hidden="true">↗</span>
      </span>
    </button>
  );
}
