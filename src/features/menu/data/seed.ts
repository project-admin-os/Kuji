import type { MenuData } from "../types";

// The v1 menu source was not included with this clone, so the seed intentionally
// contains no invented products, prices, or image paths.
export const seedMenu: MenuData = {
  schemaVersion: 1,
  revision: 0,
  updatedAt: "",
  categories: [],
  addOns: [],
  products: [],
  signatures: [],
  pairings: [],
  popup: {
    enabled: false,
    title: { en: "", ar: "" },
    body: { en: "", ar: "" },
    image: "",
    ctaLabel: { en: "", ar: "" },
    ctaUrl: "",
    delaySeconds: 5,
  },
};
