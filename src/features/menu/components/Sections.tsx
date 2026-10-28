import type { Locale } from "@/shared/i18n";
import type { MenuCatalog } from "../lib/catalog";
import type { MenuCategory, MenuData, MenuPairing, MenuProduct } from "../types";
import type { MenuStrings } from "../data/strings";
import { CategorySection } from "./CategorySection";
import { PairingsSection } from "./PairingsSection";
import { SignaturesSection } from "./SignaturesSection";

interface SectionsProps {
  menu: MenuData;
  catalog: MenuCatalog;
  locale: Locale;
  strings: MenuStrings;
  onSelectProduct: (product: MenuProduct) => void;
  onSelectPairing: (pairing: MenuPairing) => void;
  onSelectCategory: (category: MenuCategory) => void;
}

export function Sections({ menu, catalog, locale, strings, onSelectProduct, onSelectPairing, onSelectCategory }: SectionsProps) {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-32 sm:px-8 lg:px-12">
      <SignaturesSection products={catalog.signatures} locale={locale} strings={strings} onSelect={onSelectProduct} />
      <PairingsSection pairings={catalog.pairings} locale={locale} strings={strings} onSelect={onSelectPairing} />
      {catalog.categories.map(({ category, products }) => (
        <CategorySection key={category.id} category={category} products={products} locale={locale} strings={strings} onSelectProduct={onSelectProduct} onSelectCategory={onSelectCategory} />
      ))}
      {menu.products.length === 0 && (
        <div className="my-8 rounded-3xl border border-dashed border-navy/20 bg-white/65 px-6 py-12 text-center">
          <p className="mx-auto max-w-md text-body font-semibold text-navy/65">{strings.menuBeingPrepared}</p>
        </div>
      )}
    </div>
  );
}
