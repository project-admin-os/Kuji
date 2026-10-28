import type { Locale } from "@/shared/i18n";
import type { MenuCategory, MenuProduct } from "../types";
import type { MenuStrings } from "../data/strings";
import { localized } from "../lib/i18n";
import { ListCard } from "./ListCard";

interface CategorySectionProps {
  category: MenuCategory;
  products: MenuProduct[];
  locale: Locale;
  strings: MenuStrings;
  onSelectProduct: (product: MenuProduct) => void;
  onSelectCategory: (category: MenuCategory) => void;
}

export function CategorySection({ category, products, locale, strings, onSelectProduct, onSelectCategory }: CategorySectionProps) {
  if (products.length === 0) return null;
  return (
    <section id={`menu-section-${category.id}`} className="scroll-mt-32 py-7">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-caption font-bold uppercase tracking-[0.18em] text-navy/45">{localized(category.pill, locale)}</p>
          <button type="button" onClick={() => onSelectCategory(category)} className="mt-1 rounded text-start text-title font-bold text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
            {localized(category.title, locale)}
          </button>
          {localized(category.subtitle, locale) && <p className="mt-1 text-small text-navy/60">{localized(category.subtitle, locale)}</p>}
        </div>
        <span className="shrink-0 text-caption font-semibold text-navy/45">{products.length}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => <ListCard key={product.id} product={product} locale={locale} strings={strings} onSelect={onSelectProduct} />)}
      </div>
    </section>
  );
}
