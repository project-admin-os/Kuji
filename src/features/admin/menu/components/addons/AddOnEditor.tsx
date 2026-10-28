import type { Locale } from "@/shared/i18n";
import { localized } from "@/features/menu/lib/i18n";
import type { MenuAddOn, MenuIssue } from "@/features/menu/types";
import type { MenuAdminStrings } from "../../data/strings";
import { L10nField } from "../fields/L10nField";
import { NumberField } from "../fields/NumberField";
import { SelectField } from "../fields/SelectField";
import { Toggle } from "../fields/Toggle";

interface AddOnEditorProps {
  addOn: MenuAddOn;
  index: number;
  locale: Locale;
  copy: MenuAdminStrings;
  issues: MenuIssue[];
  onChange: (addOn: MenuAddOn) => void;
  onDone: () => void;
  onCancel: () => void;
}

export function AddOnEditor({ addOn, index, locale, copy, issues, onChange, onDone, onCancel }: AddOnEditorProps) {
  const base = `addOns.${index}`;
  const update = (patch: Partial<MenuAddOn>) => onChange({ ...addOn, ...patch });
  const priceIssue = issues.find((issue) => issue.path === `${base}.price`);
  return (
    <section className="grid gap-5 rounded-2xl border border-navy/15 bg-white p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 pb-3">
        <div><h3 className="text-subheading font-bold text-navy">{localized(addOn.name, locale) || copy.addonName}</h3><p className="mt-1 break-all text-caption text-navy/40">{addOn.id}</p></div>
        <div className="flex gap-2"><button type="button" onClick={onCancel} className="min-h-10 rounded-full border border-navy/15 px-4 text-caption font-semibold hover:bg-mist">{copy.cancel}</button><button type="button" onClick={onDone} className="min-h-10 rounded-full bg-navy px-4 text-caption font-bold text-white">{copy.save}</button></div>
      </div>
      <L10nField label={copy.addonName} value={addOn.name} onChange={(name) => update({ name })} path={`${base}.name`} issues={issues} copy={copy} maxLength={60} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id={`addon-${addOn.id}-price`} label={copy.price} value={addOn.price} onChange={(price) => update({ price: price ?? 0 })} error={priceIssue ? copy.fieldInvalid : undefined} />
        <SelectField id={`addon-${addOn.id}-scope`} label={copy.appliesTo} value={addOn.appliesTo} onChange={(appliesTo) => update({ appliesTo: appliesTo as MenuAddOn["appliesTo"] })} options={[{ value: "all", label: copy.allItems }, { value: "drink", label: copy.drinks }, { value: "food", label: copy.food }]} />
      </div>
      <Toggle checked={addOn.enabled} onChange={(enabled) => update({ enabled })} label={copy.enabled} />
    </section>
  );
}
