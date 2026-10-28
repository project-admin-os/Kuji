import type { Locale } from "@/shared/i18n";
import { localized } from "@/features/menu/lib/i18n";
import type { MenuIssue, MenuPairing, MenuProduct } from "@/features/menu/types";
import type { MenuAdminStrings } from "../../data/strings";
import { createMenuId } from "../../config";
import { L10nField } from "../fields/L10nField";
import { NumberField } from "../fields/NumberField";
import { SelectField } from "../fields/SelectField";
import { Toggle } from "../fields/Toggle";
import { ReorderButtons } from "../fields/ReorderButtons";

interface PairingsEditorProps {
  pairings: MenuPairing[];
  products: MenuProduct[];
  locale: Locale;
  copy: MenuAdminStrings;
  issues: MenuIssue[];
  onChange: (pairings: MenuPairing[]) => void;
  onRequestRemove: (pairing: MenuPairing) => void;
}

export function PairingsEditor({ pairings, products, locale, copy, issues, onChange, onRequestRemove }: PairingsEditorProps) {
  const add = () => {
    const [first, second] = products;
    if (!first || !second) return;
    onChange([...pairings, { id: createMenuId("pairing"), title: { en: "", ar: "" }, items: [first.id, second.id], price: null, enabled: true, sortOrder: pairings.length }]);
  };
  const options = products.map((product) => ({ value: product.id, label: localized(product.name, locale) || product.id }));
  const move = (id: string, direction: -1 | 1) => {
    const index = pairings.findIndex((pairing) => pairing.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= pairings.length) return;
    const next = [...pairings];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((pairing, sortOrder) => ({ ...pairing, sortOrder })));
  };

  return (
    <section className="grid gap-4 rounded-2xl border border-navy/10 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-small font-bold text-navy">{copy.pairings}</h3><p className="mt-1 text-caption text-navy/55">{copy.pairingProducts}</p></div><button type="button" disabled={products.length < 2} onClick={add} className="min-h-10 rounded-full border border-navy/15 px-4 text-caption font-bold text-navy hover:bg-yellow disabled:cursor-not-allowed disabled:opacity-40">{copy.addPairing}</button></div>
      {pairings.length === 0 ? <p className="rounded-xl bg-mist/60 p-4 text-caption text-navy/55">{copy.noPairings}</p> : pairings.map((pairing, index) => {
        const path = `pairings.${index}`;
        const firstOptions = options.filter((option) => option.value !== pairing.items[1]);
        const secondOptions = options.filter((option) => option.value !== pairing.items[0]);
        const firstValue = firstOptions.some((option) => option.value === pairing.items[0]) ? pairing.items[0] : firstOptions[0]?.value ?? "";
        const secondValue = secondOptions.some((option) => option.value === pairing.items[1]) ? pairing.items[1] : secondOptions[0]?.value ?? "";
        const update = (patch: Partial<MenuPairing>) => onChange(pairings.map((item) => item.id === pairing.id ? { ...item, ...patch } : item));
        const updateItem = (position: 0 | 1, value: string) => {
          const items: [string, string] = position === 0 ? [value, pairing.items[1]] : [pairing.items[0], value];
          update({ items });
        };
        const priceIssue = issues.some((issue) => issue.path === `${path}.price`);
        return (
          <article key={pairing.id} className="grid gap-4 rounded-xl border border-navy/10 bg-mist/40 p-4">
            <div className="flex items-center justify-between gap-2"><span className="text-caption font-semibold text-navy/55">{pairing.id}</span><div className="flex items-center gap-2"><ReorderButtons labels={{ up: copy.up, down: copy.down }} canMoveUp={index > 0} canMoveDown={index < pairings.length - 1} onMoveUp={() => move(pairing.id, -1)} onMoveDown={() => move(pairing.id, 1)} /><button type="button" onClick={() => onRequestRemove(pairing)} className="min-h-9 rounded-full px-3 text-caption font-semibold text-error hover:bg-error/5">{copy.delete}</button></div></div>
            <L10nField label={copy.pairingTitle} value={pairing.title} onChange={(title) => update({ title })} path={`${path}.title`} issues={issues} copy={copy} maxLength={60} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField id={`${pairing.id}-first`} label={`${copy.pairingProducts} 1`} value={firstValue} onChange={(value) => updateItem(0, value)} options={firstOptions} />
              <SelectField id={`${pairing.id}-second`} label={`${copy.pairingProducts} 2`} value={secondValue} onChange={(value) => updateItem(1, value)} options={secondOptions} />
            </div>
            <NumberField id={`${pairing.id}-price`} label={copy.pairingPrice} value={pairing.price} onChange={(price) => update({ price })} error={priceIssue ? copy.fieldInvalid : undefined} hint={copy.priceOnRequest} />
            <Toggle checked={pairing.enabled} onChange={(enabled) => update({ enabled })} label={copy.enabled} />
          </article>
        );
      })}
    </section>
  );
}
