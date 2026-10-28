import type { Locale } from "@/shared/i18n";
import type { MenuCategory, MenuProduct } from "../types";
import type { MenuStrings } from "../data/strings";
import { localized } from "../lib/i18n";
import { ListCard } from "./ListCard";
import { Sheet } from "./Sheet";

interface CategorySheetProps {
  category: MenuCategory | null;
  products: MenuProduct[];
  locale: Locale;
  strings: MenuStrings;
  onClose: () => void;
  onSelectProduct: (product: MenuProduct) => void;
}

export function CategorySheet({ category, products, locale, strings, onClose, onSelectProduct }: CategorySheetProps) {
  if (!category) return null;
  return (
    <Sheet open title={localized(category.title, locale)} strings={strings} onClose={onClose}>
      <p className="mb-5 text-small leading-relaxed text-navy/65">{localized(category.subtitle, locale)}</p>
      <div className="space-y-3">
        {products.map((product) => <ListCard key={product.id} product={product} locale={locale} strings={strings} onSelect={onSelectProduct} />)}
      </div>
    </Sheet>
  );
}
