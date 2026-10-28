import type { Localized } from "@/shared/i18n";

export type L10n = Localized<string>;
export type MenuKind = "drink" | "food";
export type AddOnScope = "all" | MenuKind;
export type SizePriceMode = "delta" | "standalone";

export interface MenuCategory {
  id: string;
  kind: MenuKind;
  pill: L10n;
  title: L10n;
  subtitle: L10n;
  image: string;
  sortOrder: number;
}

export interface MenuAddOn {
  id: string;
  name: L10n;
  price: number;
  appliesTo: AddOnScope;
  enabled: boolean;
  sortOrder: number;
}

export interface MenuSize {
  id: string;
  name: L10n;
  mode: SizePriceMode;
  value: number;
}

export interface MenuProduct {
  id: string;
  categoryId: string;
  name: L10n;
  description: L10n;
  price: number | null;
  sizes: MenuSize[];
  image: string;
  baristaAddOns: string[];
  excludedAddOns: string[];
  oftenOrderedWith: string[];
  isNew: boolean;
  inStock: boolean;
  sortOrder: number;
}

export interface MenuPairing {
  id: string;
  title: L10n;
  items: [string, string];
  price: number | null;
  enabled: boolean;
  sortOrder: number;
}

export interface MenuPopup {
  enabled: boolean;
  title: L10n;
  body: L10n;
  image: string;
  ctaLabel: L10n;
  ctaUrl: string;
  delaySeconds: number;
}

export interface MenuData {
  schemaVersion: 1;
  revision: number;
  updatedAt: string;
  categories: MenuCategory[];
  addOns: MenuAddOn[];
  products: MenuProduct[];
  signatures: string[];
  pairings: MenuPairing[];
  popup: MenuPopup;
}

export interface ConfiguredProduct {
  productId: string;
  sizeId: string | null;
  addOnIds: string[];
}

export interface ProductOrderLine {
  id: string;
  kind: "product";
  productId: string;
  sizeId: string | null;
  addOnIds: string[];
  quantity: number;
}

export interface PairingOrderLine {
  id: string;
  kind: "pairing";
  pairingId: string;
  products: [ConfiguredProduct, ConfiguredProduct];
  quantity: number;
}

export type OrderLine = ProductOrderLine | PairingOrderLine;

export interface MenuApiResponse {
  ok: true;
  menu: MenuData;
}

export interface MenuIssue {
  path: string;
  code: string;
}
