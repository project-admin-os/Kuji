import type { Locale } from "@/shared/i18n";
import type { MenuData, MenuProduct } from "../types";
import { localized } from "./i18n";

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}

export function searchMenu(menu: MenuData, query: string, locale: Locale): MenuProduct[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return menu.products.filter((product) => {
    const category = menu.categories.find((item) => item.id === product.categoryId);
    const haystack = normalize([
      localized(product.name, locale),
      localized(product.description, locale),
      localized(category?.title, locale),
    ].join(" "));
    return terms.every((term) => haystack.includes(term));
  });
}
