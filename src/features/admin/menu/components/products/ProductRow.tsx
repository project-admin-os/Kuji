import type { Locale } from "@/shared/i18n";
import { localized } from "@/features/menu/lib/i18n";
import { formatPrice } from "@/features/menu/lib/i18n";
import type { MenuCategory, MenuProduct } from "@/features/menu/types";
import type { MenuAdminStrings } from "../../data/strings";
import { ReorderButtons } from "../fields/ReorderButtons";

interface ProductRowProps {
  product: MenuProduct;
  category?: MenuCategory;
  index: number;
  length: number;
  locale: Locale;
  copy: MenuAdminStrings;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function ProductRow({ product, category, index, length, locale, copy, onEdit, onDelete, onMoveUp, onMoveDown }: ProductRowProps) {
  const price = product.price === null ? copy.priceOnRequest : formatPrice(product.price, locale);
  return (
    <li className="grid gap-3 rounded-2xl border border-navy/10 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-small font-bold text-navy">{localized(product.name, locale) || product.id}</h3>
          {product.isNew && <span className="rounded-full bg-yellow/70 px-2 py-0.5 text-[10px] font-bold text-navy">NEW</span>}
          {!product.inStock && <span className="rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-bold text-error">{copy.soldOut}</span>}
        </div>
        <p className="mt-1 text-caption text-navy/55">{category ? localized(category.title, locale) : copy.chooseCategory} · {price}</p>
        <p className="mt-1 break-all text-[10px] text-navy/35">{product.id}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <ReorderButtons onMoveUp={onMoveUp} onMoveDown={onMoveDown} canMoveUp={index > 0} canMoveDown={index < length - 1} labels={{ up: copy.up, down: copy.down }} />
        <button type="button" onClick={onEdit} className="min-h-9 rounded-full border border-navy/15 px-3 text-caption font-semibold text-navy hover:bg-mist">{copy.edit}</button>
        <button type="button" onClick={onDelete} className="min-h-9 rounded-full px-3 text-caption font-semibold text-error hover:bg-error/5">{copy.delete}</button>
      </div>
    </li>
  );
}
