import { useState } from "react";
import type { Locale } from "@/shared/i18n";
import type { ConfiguredProduct, MenuData, MenuPairing, MenuProduct } from "../types";
import type { MenuStrings } from "../data/strings";
import { getPairingPrice, getProductPrice } from "../lib/pricing";
import { formatPrice, localized } from "../lib/i18n";
import { useOptions } from "./hooks/useOptions";
import { Sheet } from "./Sheet";

interface OfferSheetProps {
  pairing: MenuPairing | null;
  products: [MenuProduct, MenuProduct] | null;
  menu: MenuData;
  locale: Locale;
  strings: MenuStrings;
  onClose: () => void;
  onAdd: (pairing: MenuPairing, products: [ConfiguredProduct, ConfiguredProduct]) => void;
}

export function OfferSheet({ pairing, products, menu, locale, strings, onClose, onAdd }: OfferSheetProps) {
  const [firstSize, setFirstSize] = useState<string | null>(products?.[0].sizes[0]?.id ?? null);
  const [secondSize, setSecondSize] = useState<string | null>(products?.[1].sizes[0]?.id ?? null);
  const firstOptions = useOptions(products?.[0] ?? emptyProduct, menu);
  const secondOptions = useOptions(products?.[1] ?? emptyProduct, menu);
  if (!pairing || !products) return null;
  const [first, second] = products;
  const title = localized(pairing.title, locale) || `${localized(first.name, locale)} + ${localized(second.name, locale)}`;
  const configuredProducts: [ConfiguredProduct, ConfiguredProduct] = [
    { productId: first.id, sizeId: firstSize, addOnIds: firstOptions.selected },
    { productId: second.id, sizeId: secondSize, addOnIds: secondOptions.selected },
  ];
  const pairingTotal = getPairingPrice(menu, pairing, configuredProducts);
  const available = first.inStock && second.inStock;
  const showProduct = (product: MenuProduct, selectedSize: string | null, setSelectedSize: (value: string | null) => void, options: ReturnType<typeof useOptions>) => (
    <div className="rounded-2xl bg-white p-4">
      <h3 className="font-bold">{localized(product.name, locale)}</h3>
      {product.sizes.length > 0 && <label className="mt-3 block text-small">
        <span className="mb-1 block font-semibold">{strings.size}</span>
        <select value={selectedSize ?? ""} onChange={(event) => setSelectedSize(event.target.value || null)} className="min-h-11 w-full rounded-xl border border-navy/15 bg-mist px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
          {product.sizes.map((size) => <option key={size.id} value={size.id}>{localized(size.name, locale)}{getProductPrice(product, size.id) === null ? "" : ` — ${formatPrice(getProductPrice(product, size.id)!, locale)}`}</option>)}
        </select>
      </label>}
      {options.available.length > 0 && <fieldset className="mt-3 space-y-2">
        <legend className="mb-1 text-small font-semibold">{strings.options}</legend>
        {options.available.map((addOn) => <label key={addOn.id} className="flex items-center justify-between gap-3 text-small">
          <span>{localized(addOn.name, locale)} <span className="text-navy/55">+ {formatPrice(addOn.price, locale)}</span></span>
          <input type="checkbox" checked={options.selected.includes(addOn.id)} onChange={() => options.toggle(addOn.id)} className="size-5 accent-navy" />
        </label>)}
      </fieldset>}
    </div>
  );
  return (
    <Sheet open title={title} strings={strings} onClose={onClose} size="wide">
      <div className="grid gap-3 sm:grid-cols-2">
        {showProduct(first, firstSize, setFirstSize, firstOptions)}
        {showProduct(second, secondSize, setSecondSize, secondOptions)}
      </div>
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-yellow/60 px-4 py-3 text-small">
        <span>{strings.total}</span>
        <strong>{pairingTotal === null ? strings.priceOnRequest : formatPrice(pairingTotal, locale)}</strong>
      </div>
      <button type="button" onClick={() => onAdd(pairing, configuredProducts)} disabled={!available} className="mt-5 min-h-12 w-full rounded-full bg-navy px-5 font-bold text-white transition hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow disabled:cursor-not-allowed disabled:opacity-50">
        {available ? strings.addToOrder : strings.soldOut}
      </button>
    </Sheet>
  );
}

const emptyProduct: MenuProduct = {
  id: "", categoryId: "", name: { en: "", ar: "" }, description: { en: "", ar: "" }, price: null,
  sizes: [], image: "", baristaAddOns: [], excludedAddOns: [], oftenOrderedWith: [], isNew: false, inStock: false, sortOrder: 0,
};
