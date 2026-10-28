import { useEffect, useState } from "react";
import type { Locale } from "@/shared/i18n";
import type { MenuData, MenuProduct } from "../types";
import type { MenuStrings } from "../data/strings";
import { searchMenu } from "../lib/search";
import { ListCard } from "./ListCard";
import { Sheet } from "./Sheet";

interface SearchOverlayProps {
  open: boolean;
  menu: MenuData;
  locale: Locale;
  strings: MenuStrings;
  onClose: () => void;
  onSelectProduct: (product: MenuProduct) => void;
}

export function SearchOverlay({ open, menu, locale, strings, onClose, onSelectProduct }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 120);
    return () => window.clearTimeout(timer);
  }, [query]);
  const results = searchMenu(menu, debouncedQuery, locale);
  return (
    <Sheet open={open} title={strings.search} strings={strings} onClose={onClose} size="wide">
      <label className="sr-only" htmlFor="menu-search">{strings.searchPlaceholder}</label>
      <input id="menu-search" autoComplete="off" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={strings.searchPlaceholder} className="min-h-12 w-full rounded-2xl border border-navy/15 bg-white px-4 text-body outline-none placeholder:text-navy/40 focus:border-navy focus:ring-2 focus:ring-navy/10" />
      <div className="mt-4 max-h-[55dvh] space-y-3 overflow-y-auto">
        {results.map((product) => <ListCard key={product.id} product={product} locale={locale} strings={strings} onSelect={onSelectProduct} />)}
        {debouncedQuery.trim() && results.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-small text-navy/60">{strings.searchNoResults}</p>}
      </div>
    </Sheet>
  );
}
