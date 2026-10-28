import type { MenuAddOn, MenuData, MenuProduct } from "../types";

export function availableAddOns(product: MenuProduct, menu: MenuData): MenuAddOn[] {
  const allowed = new Set(product.baristaAddOns);
  const excluded = new Set(product.excludedAddOns);
  return menu.addOns
    .filter((addOn) => {
      if (!addOn.enabled || excluded.has(addOn.id)) return false;
      if (allowed.size > 0 && !allowed.has(addOn.id)) return false;
      const category = menu.categories.find((item) => item.id === product.categoryId);
      return addOn.appliesTo === "all" || addOn.appliesTo === category?.kind;
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
}
