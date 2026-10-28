import type { Locale } from "@/shared/i18n";
import type { MenuData, OrderLine } from "../types";
import type { MenuStrings } from "../data/strings";
import { formatPrice, localized } from "../lib/i18n";
import { getLinePrice } from "../lib/pricing";
import { clearOrder, removeOrderLine, setOrderNote, setOrderQuantity, useOrder } from "../orderStore";
import { Icon } from "@/shared/icons";
import { Sheet } from "./Sheet";

interface OrderSheetProps {
  open: boolean;
  menu: MenuData;
  locale: Locale;
  strings: MenuStrings;
  onClose: () => void;
}

function lineTitle(menu: MenuData, line: OrderLine, locale: Locale): string {
  if (line.kind === "product") {
    const product = menu.products.find((item) => item.id === line.productId);
    return product ? localized(product.name, locale) : "";
  }
  const first = menu.products.find((item) => item.id === line.products[0].productId);
  const second = menu.products.find((item) => item.id === line.products[1].productId);
  return [first, second].filter(Boolean).map((product) => localized(product!.name, locale)).join(" + ");
}

export function OrderSheet({ open, menu, locale, strings, onClose }: OrderSheetProps) {
  const order = useOrder();
  return (
    <Sheet open={open} title={strings.orderTitle} strings={strings} onClose={onClose} size="wide">
      {order.lines.length === 0 ? <p className="rounded-2xl bg-white p-6 text-center text-small text-navy/60">{strings.emptyOrder}</p> : (
        <div className="space-y-3">
          {order.lines.map((line) => {
            const unit = getLinePrice(menu, line);
            return <article key={line.id} className="flex items-center gap-3 rounded-2xl bg-white p-4">
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold">{lineTitle(menu, line, locale) || strings.priceOnRequest}</h3>
                <p className="mt-1 text-small text-navy/55">{unit === null ? strings.priceOnRequest : formatPrice(unit * line.quantity, locale)}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-mist p-1">
                <button type="button" onClick={() => setOrderQuantity(line.id, line.quantity - 1)} className="grid size-9 place-items-center rounded-full hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" aria-label={strings.decrease}><Icon name="minus" className="size-4" /></button>
                <span className="min-w-7 text-center text-small font-bold" aria-label={strings.quantity}>{line.quantity}</span>
                <button type="button" onClick={() => setOrderQuantity(line.id, line.quantity + 1)} className="grid size-9 place-items-center rounded-full hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" aria-label={strings.increase}><Icon name="plus" className="size-4" /></button>
              </div>
              <button type="button" onClick={() => removeOrderLine(line.id)} className="rounded-full px-2 py-2 text-caption font-semibold text-navy/55 hover:bg-mist hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">{strings.remove}</button>
            </article>;
          })}
        </div>
      )}
      {order.lines.length > 0 && <>
        <label className="mt-5 block text-small font-semibold" htmlFor="menu-order-note">{strings.orderNote}</label>
        <textarea id="menu-order-note" maxLength={300} value={order.note} onChange={(event) => setOrderNote(event.target.value)} rows={3} className="mt-2 w-full resize-y rounded-2xl border border-navy/15 bg-white p-3 text-small outline-none focus-visible:ring-2 focus-visible:ring-navy" />
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-navy/10 pt-4">
          <span className="text-small font-semibold">{strings.total}</span>
          <strong className="text-body">{(() => { const total = order.lines.reduce<number | null>((sum, line) => { const amount = getLinePrice(menu, line); return sum === null || amount === null ? null : sum + amount * line.quantity; }, 0); return total === null ? strings.totalUnavailable : formatPrice(total, locale); })()}</strong>
        </div>
        <button type="button" onClick={() => { clearOrder(); onClose(); }} className="mt-5 min-h-11 rounded-full border border-navy/15 px-4 text-small font-semibold hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">{strings.clearOrder}</button>
      </>}
    </Sheet>
  );
}
