import type { Locale } from "@/shared/i18n";
import { localized } from "@/features/menu/lib/i18n";
import type { MenuProduct } from "@/features/menu/types";
import type { MenuAdminStrings } from "../../data/strings";
import { RelationPicker } from "../products/RelationPicker";
import { ReorderButtons } from "../fields/ReorderButtons";

interface SignaturesEditorProps {
  products: MenuProduct[];
  selected: string[];
  locale: Locale;
  copy: MenuAdminStrings;
  onChange: (selected: string[]) => void;
}

export function SignaturesEditor({ products, selected, locale, copy, onChange }: SignaturesEditorProps) {
  const options = products.map((product) => ({ id: product.id, label: localized(product.name, locale) || product.id }));
  const selectedProducts = selected.map((id) => products.find((product) => product.id === id)).filter((product): product is MenuProduct => Boolean(product));
  const move = (id: string, direction: -1 | 1) => {
    const index = selected.indexOf(id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= selected.length) return;
    const next = [...selected];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return (
    <section className="grid gap-3 rounded-2xl border border-navy/10 bg-white p-4 sm:p-5">
      <div><h3 className="text-small font-bold text-navy">{copy.signatures}</h3><p className="mt-1 text-caption text-navy/55">{copy.signatureHint}</p></div>
      <RelationPicker label={copy.signatures} options={options} selected={selected} onChange={onChange} emptyLabel={copy.noFeaturedProducts} />
      {selectedProducts.length > 0 && <ol className="grid gap-2">{selectedProducts.map((product, index) => <li key={product.id} className="flex items-center justify-between gap-2 rounded-xl border border-navy/10 bg-mist/40 px-3 py-2"><span className="truncate text-small text-navy">{localized(product.name, locale) || product.id}</span><ReorderButtons labels={{ up: copy.up, down: copy.down }} canMoveUp={index > 0} canMoveDown={index < selectedProducts.length - 1} onMoveUp={() => move(product.id, -1)} onMoveDown={() => move(product.id, 1)} /></li>)}</ol>}
    </section>
  );
}
