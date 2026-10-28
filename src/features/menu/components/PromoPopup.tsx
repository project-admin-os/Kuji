import { useEffect, useState } from "react";
import { handleInternalClick } from "@/shared/router";
import type { Locale } from "@/shared/i18n";
import type { MenuPopup } from "../types";
import type { MenuStrings } from "../data/strings";
import { localized } from "../lib/i18n";
import { Sheet } from "./Sheet";

const DISMISS_KEY = "kuji:menu-promo-dismissed:v1";
const DISMISS_MS = 24 * 60 * 60 * 1000;

interface PromoPopupProps {
  popup: MenuPopup;
  locale: Locale;
  strings: MenuStrings;
  suspend: boolean;
}

export function PromoPopup({ popup, locale, strings, suspend }: PromoPopupProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!popup.enabled || suspend) return;
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      if (Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_MS) return;
    } catch {
      // The promotion remains available for this visit when storage is disabled.
    }
    const timer = window.setTimeout(() => setOpen(true), popup.delaySeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [popup.enabled, popup.delaySeconds, suspend]);

  const close = () => {
    setOpen(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* Storage is optional for this visit-only preference. */ }
  };
  const href = popup.ctaUrl;
  const external = href.startsWith("https://");
  return (
    <Sheet open={open} title={localized(popup.title, locale)} strings={strings} onClose={close}>
      {popup.image && <img src={popup.image} alt={localized(popup.title, locale)} loading="lazy" className="mb-4 max-h-56 w-full rounded-2xl object-cover" onError={(event) => { event.currentTarget.hidden = true; }} />}
      <p className="whitespace-pre-line text-small leading-relaxed text-navy/70">{localized(popup.body, locale)}</p>
      {href && popup.ctaLabel[locale] && <a href={href} onClick={external ? undefined : handleInternalClick} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-navy px-5 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow">{localized(popup.ctaLabel, locale)}</a>}
      <button type="button" onClick={close} className="mt-3 min-h-11 w-full rounded-full text-small font-semibold text-navy/60 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">{strings.promoDismiss}</button>
    </Sheet>
  );
}
