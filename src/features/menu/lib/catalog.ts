import type { MenuCategory, MenuData, MenuPairing, MenuProduct } from "../types";
import { sortByOrder } from "./sort";

export interface MenuCatalog {
  categories: Array<{ category: MenuCategory; products: MenuProduct[] }>;
  signatures: MenuProduct[];
  pairings: Array<{ pairing: MenuPairing; products: [MenuProduct, MenuProduct] }>;
  productById: Map<string, MenuProduct>;
}

export function buildCatalog(menu: MenuData): MenuCatalog {
  const productById = new Map(menu.products.map((product) => [product.id, product]));
  const categories = sortByOrder(menu.categories).map((category) => ({
    category,
    products: sortByOrder(menu.products.filter((product) => product.categoryId === category.id)),
  }));
  const signatures = menu.signatures
    .map((id) => productById.get(id))
    .filter((product): product is MenuProduct => Boolean(product));
  const pairings = sortByOrder(menu.pairings)
    .filter((pairing) => pairing.enabled)
    .flatMap((pairing) => {
      const first = productById.get(pairing.items[0]);
      const second = productById.get(pairing.items[1]);
      return first && second ? [{ pairing, products: [first, second] as [MenuProduct, MenuProduct] }] : [];
    });
  return { categories, signatures, pairings, productById };
}
