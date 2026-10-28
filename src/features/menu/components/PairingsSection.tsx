import type { Locale } from "@/shared/i18n";
import type { MenuPairing, MenuProduct } from "../types";
import type { MenuStrings } from "../data/strings";
import { OfferCard } from "./OfferCard";

interface PairingsSectionProps {
  pairings: Array<{ pairing: MenuPairing; products: [MenuProduct, MenuProduct] }>;
  locale: Locale;
  strings: MenuStrings;
  onSelect: (pairing: MenuPairing) => void;
}

export function PairingsSection({ pairings, locale, strings, onSelect }: PairingsSectionProps) {
  if (pairings.length === 0) return null;
  return (
    <section className="py-8" aria-labelledby="menu-pairings-title">
      <h2 id="menu-pairings-title" className="mb-4 text-title font-bold text-navy">{strings.pairings}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {pairings.map(({ pairing, products }) => <OfferCard key={pairing.id} pairing={pairing} products={products} locale={locale} strings={strings} onSelect={() => onSelect(pairing)} />)}
      </div>
    </section>
  );
}
