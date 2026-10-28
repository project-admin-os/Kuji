import type { Locale } from "@/shared/i18n";
import { formatPrice, localized } from "@/features/menu/lib/i18n";
import type { MenuAddOn } from "@/features/menu/types";
import type { MenuAdminStrings } from "../../data/strings";
import { ReorderButtons } from "../fields/ReorderButtons";

interface AddOnListProps {
  addOns: MenuAddOn[];
  locale: Locale;
  copy: MenuAdminStrings;
  onAdd: () => void;
  onEdit: (addOn: MenuAddOn) => void;
  onDelete: (addOn: MenuAddOn) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}

export function AddOnList({ addOns, locale, copy, onAdd, onEdit, onDelete, onMove }: AddOnListProps) {
  return (
    <section className="grid gap-4">
      <div className="flex justify-end"><button type="button" onClick={onAdd} className="min-h-11 rounded-full bg-navy px-5 text-small font-bold text-white hover:bg-navy/90">{copy.addAddon}</button></div>
      {addOns.length === 0 ? <p className="rounded-2xl border border-dashed border-navy/20 bg-white/70 p-8 text-center text-small text-navy/55">{copy.noAddons}</p> : (
        <ul className="grid gap-2">
          {addOns.map((addOn, index) => <li key={addOn.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy/10 bg-white p-4">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-small font-bold text-navy">{localized(addOn.name, locale) || addOn.id}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${addOn.enabled ? "bg-success/10 text-success" : "bg-navy/5 text-navy/45"}`}>{addOn.enabled ? copy.enabled : copy.unpublished}</span></div><p className="mt-1 text-caption text-navy/55">{formatPrice(addOn.price, locale)} · {copy.appliesTo}: {addOn.appliesTo}</p></div>
            <div className="flex flex-wrap items-center gap-2"><ReorderButtons onMoveUp={() => onMove(addOn.id, -1)} onMoveDown={() => onMove(addOn.id, 1)} canMoveUp={index > 0} canMoveDown={index < addOns.length - 1} labels={{ up: copy.up, down: copy.down }} /><button type="button" onClick={() => onEdit(addOn)} className="min-h-9 rounded-full border border-navy/15 px-3 text-caption font-semibold hover:bg-mist">{copy.edit}</button><button type="button" onClick={() => onDelete(addOn)} className="min-h-9 rounded-full px-3 text-caption font-semibold text-error hover:bg-error/5">{copy.delete}</button></div>
          </li>)}
        </ul>
      )}
    </section>
  );
}
