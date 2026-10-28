import { useState } from "react";
import type { Locale } from "@/shared/i18n";
import type { MenuData, MenuProduct } from "../types";
import type { MenuStrings } from "../data/strings";
import { getAddOnPrice, getProductPrice } from "../lib/pricing";
import { localized, formatPrice } from "../lib/i18n";
import { useOptions } from "./hooks/useOptions";
import { Sheet } from "./Sheet";

interface ItemSheetProps {
  product: MenuProduct | null;
  menu: MenuData;
  locale: Locale;
  strings: MenuStrings;
  onClose: () => void;
  onAdd: (product: MenuProduct, sizeId: string | null, addOnIds: string[]) => void;
  onSelectProduct: (product: MenuProduct) => void;
}

export function ItemSheet({ product, menu, locale, strings, onClose, onAdd, onSelectProduct }: ItemSheetProps) {
  const [sizeId, setSizeId] = useState<string | null>(product?.sizes[0]?.id ?? null);
  const options = useOptions(product ?? menu.products[0] ?? emptyProduct, menu);
  if (!product) return null;
  const price = getProductPrice(product, sizeId);
  const addOnPrice = getAddOnPrice(menu, options.selected);
  const total = price === null || addOnPrice === null ? null : price + addOnPrice;

  return (
    <Sheet open title={localized(product.name, locale)} strings={strings} onClose={onClose}>
      {product.image && <img src={product.image} alt={localized(product.name, locale)} loading="lazy" className="mb-5 max-h-64 w-full rounded-2xl object-cover" onError={(event) => { event.currentTarget.hidden = true; }} />}
      <p className="whitespace-pre-line text-small leading-relaxed text-navy/70">{localized(product.description, locale)}</p>
      <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3">
        <span className="text-small font-semibold">{strings.total}</span>
        <span className="font-bold">{total === null ? strings.priceOnRequest : formatPrice(total, locale)}</span>
      </div>
      {product.sizes.length > 0 && (
        <fieldset className="mt-6">
          <legend className="mb-2 text-small font-bold">{strings.size}</legend>
          <div className="grid grid-cols-2 gap-2">
            {product.sizes.map((size) => {
              const amount = getProductPrice(product, size.id);
              return <button key={size.id} type="button" aria-pressed={sizeId === size.id} onClick={() => setSizeId(size.id)} className={`min-h-12 rounded-xl border px-3 text-small font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${sizeId === size.id ? "border-navy bg-navy text-white" : "border-navy/15 bg-white hover:border-navy/40"}`}>
                <span className="block">{localized(size.name, locale)}</span>
                {amount !== null && <span className="mt-0.5 block text-caption opacity-70">{formatPrice(amount, locale)}</span>}
              </button>;
            })}
          </div>
        </fieldset>
      )}
      <fieldset className="mt-6">
        <legend className="mb-2 text-small font-bold">{strings.options}</legend>
        {options.available.length === 0 ? <p className="text-small text-navy/55">{strings.noOptions}</p> : (
          <div className="space-y-2">
            {options.available.map((addOn) => <label key={addOn.id} className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-small">
              <span>{localized(addOn.name, locale)} <span className="text-navy/55">+ {formatPrice(addOn.price, locale)}</span></span>
              <input type="checkbox" checked={options.selected.includes(addOn.id)} onChange={() => options.toggle(addOn.id)} className="size-5 accent-navy" />
            </label>)}
          </div>
        )}
      </fieldset>
      {product.oftenOrderedWith.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-small font-bold">{strings.pairings}</p>
          <div className="flex flex-wrap gap-2">
            {product.oftenOrderedWith.map((id) => menu.products.find((item) => item.id === id)).filter((item): item is MenuProduct => Boolean(item)).map((item) => (
              <button key={item.id} type="button" onClick={() => onSelectProduct(item)} className="min-h-10 rounded-full bg-white px-4 text-small font-semibold text-navy hover:bg-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">{localized(item.name, locale)}</button>
            ))}
          </div>
        </div>
      )}
      <button type="button" disabled={!product.inStock} onClick={() => onAdd(product, sizeId, options.selected)} className="mt-7 min-h-12 w-full rounded-full bg-navy px-5 font-bold text-white transition hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow disabled:cursor-not-allowed disabled:opacity-50">
        {product.inStock ? strings.addToOrder : strings.soldOut}
      </button>
    </Sheet>
  );
}

const emptyProduct: MenuProduct = {
  id: "",
  categoryId: "",
  name: { en: "", ar: "" },
  description: { en: "", ar: "" },
  price: null,
  sizes: [],
  image: "",
  baristaAddOns: [],
  excludedAddOns: [],
  oftenOrderedWith: [],
  isNew: false,
  inStock: false,
  sortOrder: 0,
};
