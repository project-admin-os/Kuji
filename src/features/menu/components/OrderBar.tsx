import { Icon } from "@/shared/icons";
import type { Locale } from "@/shared/i18n";
import type { MenuData, OrderLine } from "../types";
import type { MenuStrings } from "../data/strings";
import { calculateOrderTotal, countOrderItems } from "../lib/menuLogic";
import { formatPrice } from "../lib/i18n";

interface OrderBarProps {
  lines: OrderLine[];
  menu: MenuData;
  locale: Locale;
  strings: MenuStrings;
  onOpen: () => void;
}

export function OrderBar({ lines, menu, locale, strings, onOpen }: OrderBarProps) {
  if (lines.length === 0) return null;
  const total = calculateOrderTotal(menu, lines);
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:inset-x-auto sm:end-8 sm:w-[min(28rem,calc(100%-4rem))]">
      <button type="button" onClick={onOpen} className="flex min-h-14 w-full items-center justify-between gap-4 rounded-full bg-navy px-5 text-white shadow-xl transition hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow">
        <span className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-yellow text-navy"><Icon name="bag" className="size-5" /></span>
          <span className="text-small font-bold">{strings.reviewOrder} <span className="text-white/65">· {countOrderItems(lines)}</span></span>
        </span>
        <span className="text-small font-bold">{total === null ? strings.totalUnavailable : formatPrice(total, locale)}</span>
      </button>
    </div>
  );
}
