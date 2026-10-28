import type { Locale } from "@/shared/i18n";
import { localized } from "@/features/menu/lib/i18n";
import type { MenuCategory } from "@/features/menu/types";
import type { MenuAdminStrings } from "../../data/strings";
import { ReorderButtons } from "../fields/ReorderButtons";

interface CategoryListProps {
  categories: MenuCategory[];
  locale: Locale;
  copy: MenuAdminStrings;
  productCounts: Record<string, number>;
  onAdd: () => void;
  onEdit: (category: MenuCategory) => void;
  onDelete: (category: MenuCategory) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}

export function CategoryList({ categories, locale, copy, productCounts, onAdd, onEdit, onDelete, onMove }: CategoryListProps) {
  return (
    <section className="grid gap-4">
      <div className="flex justify-end"><button type="button" onClick={onAdd} className="min-h-11 rounded-full bg-navy px-5 text-small font-bold text-white hover:bg-navy/90">{copy.addCategory}</button></div>
      {categories.length === 0 ? <p className="rounded-2xl border border-dashed border-navy/20 bg-white/70 p-8 text-center text-small text-navy/55">{copy.noCategories}</p> : (
        <ul className="grid gap-2">
          {categories.map((category, index) => <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy/10 bg-white p-4">
            <div className="min-w-0"><h3 className="truncate text-small font-bold text-navy">{localized(category.title, locale) || category.id}</h3><p className="mt-1 text-caption text-navy/55">{localized(category.pill, locale)} · {category.kind === "drink" ? copy.drinkCategory : copy.foodCategory} · {productCounts[category.id] ?? 0}</p><p className="mt-1 break-all text-[10px] text-navy/35">{category.id}</p></div>
            <div className="flex flex-wrap items-center gap-2"><ReorderButtons onMoveUp={() => onMove(category.id, -1)} onMoveDown={() => onMove(category.id, 1)} canMoveUp={index > 0} canMoveDown={index < categories.length - 1} labels={{ up: copy.up, down: copy.down }} /><button type="button" onClick={() => onEdit(category)} className="min-h-9 rounded-full border border-navy/15 px-3 text-caption font-semibold hover:bg-mist">{copy.edit}</button><button type="button" onClick={() => onDelete(category)} className="min-h-9 rounded-full px-3 text-caption font-semibold text-error hover:bg-error/5">{copy.delete}</button></div>
          </li>)}
        </ul>
      )}
    </section>
  );
}
