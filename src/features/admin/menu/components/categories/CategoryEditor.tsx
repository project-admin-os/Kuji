import type { Locale } from "@/shared/i18n";
import { localized } from "@/features/menu/lib/i18n";
import type { MenuCategory, MenuIssue } from "@/features/menu/types";
import type { MenuAdminStrings } from "../../data/strings";
import { L10nField } from "../fields/L10nField";
import { SelectField } from "../fields/SelectField";
import { UrlField } from "../fields/UrlField";

interface CategoryEditorProps {
  category: MenuCategory;
  index: number;
  locale: Locale;
  copy: MenuAdminStrings;
  issues: MenuIssue[];
  onChange: (category: MenuCategory) => void;
  onDone: () => void;
  onCancel: () => void;
}

export function CategoryEditor({ category, index, locale, copy, issues, onChange, onDone, onCancel }: CategoryEditorProps) {
  const base = `categories.${index}`;
  const update = (patch: Partial<MenuCategory>) => onChange({ ...category, ...patch });
  return (
    <section className="grid gap-5 rounded-2xl border border-navy/15 bg-white p-4 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 pb-3">
        <div><h3 className="text-subheading font-bold text-navy">{localized(category.title, locale) || copy.titleField}</h3><p className="mt-1 break-all text-caption text-navy/40">{category.id}</p></div>
        <div className="flex gap-2"><button type="button" onClick={onCancel} className="min-h-10 rounded-full border border-navy/15 px-4 text-caption font-semibold hover:bg-mist">{copy.cancel}</button><button type="button" onClick={onDone} className="min-h-10 rounded-full bg-navy px-4 text-caption font-bold text-white">{copy.save}</button></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <L10nField label={copy.pill} value={category.pill} onChange={(pill) => update({ pill })} path={`${base}.pill`} issues={issues} copy={copy} maxLength={20} />
        <SelectField id={`category-${category.id}-kind`} label={copy.kind} value={category.kind} onChange={(kind) => update({ kind: kind as MenuCategory["kind"] })} options={[{ value: "drink", label: copy.drinkCategory }, { value: "food", label: copy.foodCategory }]} />
      </div>
      <L10nField label={copy.titleField} value={category.title} onChange={(title) => update({ title })} path={`${base}.title`} issues={issues} copy={copy} maxLength={60} required />
      <L10nField label={copy.subtitle} value={category.subtitle} onChange={(subtitle) => update({ subtitle })} path={`${base}.subtitle`} issues={issues} copy={copy} maxLength={120} multiline />
      <UrlField label={copy.image} value={category.image} onChange={(image) => update({ image })} path={`${base}.image`} issues={issues} copy={copy} hint="Use a root-relative path or HTTPS URL." />
    </section>
  );
}
