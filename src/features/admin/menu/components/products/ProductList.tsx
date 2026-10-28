import { useMemo, useState } from "react";
import type { Locale } from "@/shared/i18n";
import { localized } from "@/features/menu/lib/i18n";
import type { MenuCategory, MenuProduct } from "@/features/menu/types";
import type { MenuAdminStrings } from "../../data/strings";
import { ProductRow } from "./ProductRow";

interface ProductListProps {
  products: MenuProduct[];
  categories: MenuCategory[];
  locale: Locale;
  copy: MenuAdminStrings;
  onAdd: () => void;
  onEdit: (product: MenuProduct) => void;
  onDelete: (product: MenuProduct) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}

export function ProductList({ products, categories, locale, copy, onAdd, onEdit, onDelete, onMove }: ProductListProps) {
  const [query, setQuery] = useState("");
  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale === "ar" ? "ar-EG" : "en-EG");
    if (!normalized) return products;
    return products.filter((product) => `${localized(product.name, locale)} ${localized(product.description, locale)} ${product.id}`.toLocaleLowerCase(locale === "ar" ? "ar-EG" : "en-EG").includes(normalized));
  }, [locale, products, query]);

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="min-w-[min(100%,16rem)] flex-1">
          <span className="sr-only">{copy.search}</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder={copy.search} className="min-h-11 w-full rounded-full border border-navy/15 bg-white px-4 text-small text-navy outline-none focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy" />
        </label>
        <button type="button" onClick={onAdd} className="min-h-11 rounded-full bg-navy px-5 text-small font-bold text-white hover:bg-navy/90">{copy.addProduct}</button>
      </div>
      {filtered.length === 0 ? <p className="rounded-2xl border border-dashed border-navy/20 bg-white/70 p-8 text-center text-small text-navy/55">{products.length ? copy.noProducts : copy.noProducts}</p> : (
        <ul className="grid gap-2" aria-label={copy.productsTitle}>
          {filtered.map((product) => {
            const index = products.findIndex((entry) => entry.id === product.id);
            return <ProductRow key={product.id} product={product} category={categoryById.get(product.categoryId)} index={index} length={products.length} locale={locale} copy={copy} onEdit={() => onEdit(product)} onDelete={() => onDelete(product)} onMoveUp={() => onMove(product.id, -1)} onMoveDown={() => onMove(product.id, 1)} />;
          })}
        </ul>
      )}
    </section>
  );
}
