export const MENU_SCHEMA_VERSION = 1 as const;
export const MENU_CACHE_KEY = "kuji:menu:v1";
export const MENU_REVALIDATE_AFTER_MS = 5 * 60 * 1000;
export const MAX_ORDER_QUANTITY = 20;
export const MAX_PRICE = 99_999_999;
export const MAX_ITEMS = {
  categories: 50,
  addOns: 50,
  products: 200,
  signatures: 12,
  pairings: 100,
  sizes: 6,
};

export const MENU_API = {
  public: "/menu",
  admin: "/admin/menu",
  save: "/admin/menu/save",
} as const;
