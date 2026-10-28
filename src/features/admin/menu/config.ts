import type { MenuSection } from "./types";

export const MENU_SECTIONS: readonly MenuSection[] = ["products", "categories", "addons", "featured", "popup"];

export const EMPTY_LOCALIZED = { en: "", ar: "" } as const;

export function createMenuId(prefix: string): string {
  const source = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${source.toLowerCase()}`;
}
