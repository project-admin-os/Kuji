import type { MenuIssue, MenuSize } from "@/features/menu/types";
import type { MenuAdminStrings } from "../../data/strings";
import { createMenuId } from "../../config";
import { L10nField } from "../fields/L10nField";
import { NumberField } from "../fields/NumberField";
import { SelectField } from "../fields/SelectField";
import { ReorderButtons } from "../fields/ReorderButtons";

interface SizesEditorProps {
  sizes: MenuSize[];
  issues: MenuIssue[];
  copy: MenuAdminStrings;
  path: string;
  onChange: (sizes: MenuSize[]) => void;
  onRequestRemove: (size: MenuSize) => void;
}

export function SizesEditor({ sizes, issues, copy, path, onChange, onRequestRemove }: SizesEditorProps) {
  const add = () => onChange([...sizes, { id: createMenuId("size"), name: { en: "", ar: "" }, mode: "delta", value: 0 }]);
  return (
    <section className="grid gap-3 rounded-2xl border border-navy/10 bg-mist/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-small font-bold text-navy">{copy.sizes}</h4>
        <button type="button" onClick={add} className="min-h-10 rounded-full border border-navy/15 bg-white px-4 text-caption font-bold text-navy hover:bg-yellow">{copy.addSize}</button>
      </div>
      {sizes.length === 0 && <p className="text-caption text-navy/55">{copy.priceOnRequest}</p>}
      <div className="grid gap-3">
        {sizes.map((size, index) => {
          const sizePath = `${path}.${index}`;
          const update = (patch: Partial<MenuSize>) => onChange(sizes.map((entry) => entry.id === size.id ? { ...entry, ...patch } : entry));
          const move = (direction: -1 | 1) => {
            const target = index + direction;
            if (target < 0 || target >= sizes.length) return;
            const next = [...sizes];
            [next[index], next[target]] = [next[target], next[index]];
            onChange(next);
          };
          return (
            <div key={size.id} className="grid gap-3 rounded-xl border border-navy/10 bg-white p-3 sm:grid-cols-2">
              <div className="sm:col-span-2 flex items-center justify-between gap-2">
                <span className="text-caption font-semibold text-navy/55">{copy.sizeName} {index + 1}</span>
                <div className="flex items-center gap-2">
                  <ReorderButtons labels={{ up: copy.up, down: copy.down }} canMoveUp={index > 0} canMoveDown={index < sizes.length - 1} onMoveUp={() => move(-1)} onMoveDown={() => move(1)} />
                  <button type="button" onClick={() => onRequestRemove(size)} className="min-h-9 rounded-full px-3 text-caption font-semibold text-error hover:bg-error/5">{copy.delete}</button>
                </div>
              </div>
              <L10nField label={copy.sizeName} value={size.name} onChange={(name) => update({ name })} path={`${sizePath}.name`} issues={issues} copy={copy} maxLength={30} required />
              <div className="grid gap-3">
                <SelectField id={`${size.id}-mode`} label={copy.sizeMode} value={size.mode} onChange={(mode) => update({ mode: mode as MenuSize["mode"] })} options={[{ value: "delta", label: copy.priceDelta }, { value: "standalone", label: copy.standalonePrice }]} />
                <NumberField id={`${size.id}-value`} label={copy.sizeValue} value={size.value} onChange={(value) => update({ value: value ?? 0 })} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
