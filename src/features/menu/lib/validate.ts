import { MAX_ITEMS, MAX_PRICE, MENU_SCHEMA_VERSION } from "../config";
import type { MenuIssue, MenuData } from "../types";

type RecordValue = Record<string, unknown>;
const locales = ["en", "ar"] as const;
const idPattern = /^[a-z0-9][a-z0-9-]{0,63}$/;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isList(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function codepoints(value: string): number {
  return Array.from(value).length;
}

function safeUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (value === "") return true;
  if (value.startsWith("/") && !value.startsWith("//")) {
    const decoded = decodeURIComponentSafe(value);
    return !decoded.startsWith("//") && !decoded.includes("\\") && !/(^|\/)\.\.(\/|$)/.test(decoded);
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function validateMenu(input: unknown): MenuIssue[] {
  const issues: MenuIssue[] = [];
  const add = (path: string, code: string) => {
    if (issues.length < 50) issues.push({ path, code });
  };
  if (!isRecord(input)) return [{ path: "menu", code: "object" }];
  if (input.schemaVersion !== MENU_SCHEMA_VERSION) add("schemaVersion", "unsupported");
  if (!Number.isInteger(input.revision) || Number(input.revision) < 0) add("revision", "integer_range");
  if (typeof input.updatedAt !== "string" || codepoints(input.updatedAt) > 64) add("updatedAt", "string");

  const readRows = (value: unknown, path: string, max: number): unknown[] => {
    if (!isList(value)) {
      add(path, "array");
      return [];
    }
    if (value.length > max) add(path, "too_many");
    return value.slice(0, max);
  };
  const text = (value: unknown, path: string, max: number, required = false) => {
    if (typeof value !== "string") {
      add(path, "string");
      return;
    }
    const trimmed = value.trim();
    if (required && !trimmed) add(path, "required");
    if (codepoints(trimmed) > max) add(path, "too_long");
    const hasControlCharacter = Array.from(trimmed).some((character) => {
      const code = character.codePointAt(0) ?? 0;
      return code < 32 || code === 127;
    });
    if (hasControlCharacter) add(path, "control_character");
  };
  const l10n = (value: unknown, path: string, max: number, required = false) => {
    if (!isRecord(value)) {
      add(path, "localized_pair");
      return;
    }
    locales.forEach((locale) => text(value[locale], `${path}.${locale}`, max, required));
  };
  const validId = (value: unknown, path: string) => {
    if (typeof value !== "string" || !idPattern.test(value)) add(path, "id");
  };
  const integer = (value: unknown, path: string, min: number, max: number) => {
    if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) add(path, "integer_range");
  };
  const bool = (value: unknown, path: string) => {
    if (typeof value !== "boolean") add(path, "boolean");
  };
  const image = (value: unknown, path: string) => {
    if (typeof value !== "string") {
      add(path, "unsafe_url");
      return;
    }
    const normalized = value.trim();
    const hasControlCharacter = Array.from(normalized).some((character) => {
      const code = character.codePointAt(0) ?? 0;
      return code < 32 || code === 127;
    });
    if (codepoints(normalized) > 2048 || hasControlCharacter || !safeUrl(normalized)) add(path, "unsafe_url");
  };
  const unique = (values: unknown[], path: string) => {
    const ids = values.map((row) => isRecord(row) ? row.id : row);
    if (new Set(ids).size !== ids.length) add(path, "duplicate_id");
  };
  const stringList = (value: unknown, path: string, max: number) => {
    const rows = readRows(value, path, max);
    rows.forEach((row, index) => validId(row, `${path}.${index}`));
    unique(rows, path);
    return rows.filter((row): row is string => typeof row === "string");
  };

  const categories = readRows(input.categories, "categories", MAX_ITEMS.categories);
  categories.forEach((row, index) => {
    const path = `categories.${index}`;
    if (!isRecord(row)) return add(path, "object");
    validId(row.id, `${path}.id`);
    if (row.kind !== "drink" && row.kind !== "food") add(`${path}.kind`, "choice");
    l10n(row.pill, `${path}.pill`, 24);
    l10n(row.title, `${path}.title`, 60, true);
    l10n(row.subtitle, `${path}.subtitle`, 120);
    image(row.image, `${path}.image`);
    integer(row.sortOrder, `${path}.sortOrder`, 0, 10000);
  });
  unique(categories, "categories");

  const addOns = readRows(input.addOns, "addOns", MAX_ITEMS.addOns);
  addOns.forEach((row, index) => {
    const path = `addOns.${index}`;
    if (!isRecord(row)) return add(path, "object");
    validId(row.id, `${path}.id`);
    l10n(row.name, `${path}.name`, 60, true);
    integer(row.price, `${path}.price`, 0, MAX_PRICE);
    if (!["all", "drink", "food"].includes(String(row.appliesTo))) add(`${path}.appliesTo`, "choice");
    bool(row.enabled, `${path}.enabled`);
    integer(row.sortOrder, `${path}.sortOrder`, 0, 10000);
  });
  unique(addOns, "addOns");

  const products = readRows(input.products, "products", MAX_ITEMS.products);
  products.forEach((row, index) => {
    const path = `products.${index}`;
    if (!isRecord(row)) return add(path, "object");
    validId(row.id, `${path}.id`);
    validId(row.categoryId, `${path}.categoryId`);
    l10n(row.name, `${path}.name`, 60, true);
    l10n(row.description, `${path}.description`, 400);
    if (row.price !== null) integer(row.price, `${path}.price`, 0, MAX_PRICE);
    image(row.image, `${path}.image`);
    const sizes = readRows(row.sizes, `${path}.sizes`, MAX_ITEMS.sizes);
    sizes.forEach((size, sizeIndex) => {
      const sizePath = `${path}.sizes.${sizeIndex}`;
      if (!isRecord(size)) return add(sizePath, "object");
      validId(size.id, `${sizePath}.id`);
      l10n(size.name, `${sizePath}.name`, 30, true);
      if (size.mode !== "delta" && size.mode !== "standalone") add(`${sizePath}.mode`, "choice");
      integer(size.value, `${sizePath}.value`, 0, MAX_PRICE);
    });
    unique(sizes, `${path}.sizes`);
    const barista = stringList(row.baristaAddOns, `${path}.baristaAddOns`, MAX_ITEMS.addOns);
    const excluded = stringList(row.excludedAddOns, `${path}.excludedAddOns`, MAX_ITEMS.addOns);
    const often = stringList(row.oftenOrderedWith, `${path}.oftenOrderedWith`, 6);
    if (barista.some((id) => excluded.includes(id))) add(`${path}.excludedAddOns`, "conflicting_addon");
    if (often.includes(String(row.id))) add(`${path}.oftenOrderedWith`, "self_reference");
    bool(row.isNew, `${path}.isNew`);
    bool(row.inStock, `${path}.inStock`);
    integer(row.sortOrder, `${path}.sortOrder`, 0, 10000);
  });
  unique(products, "products");

  const signatures = stringList(input.signatures, "signatures", MAX_ITEMS.signatures);
  const pairings = readRows(input.pairings, "pairings", MAX_ITEMS.pairings);
  pairings.forEach((row, index) => {
    const path = `pairings.${index}`;
    if (!isRecord(row)) return add(path, "object");
    validId(row.id, `${path}.id`);
    l10n(row.title, `${path}.title`, 60, true);
    if (!isList(row.items) || row.items.length !== 2) {
      add(`${path}.items`, "two_products_required");
    } else {
      row.items.forEach((id, itemIndex) => validId(id, `${path}.items.${itemIndex}`));
      if (row.items[0] === row.items[1]) add(`${path}.items`, "distinct_products_required");
    }
    if (row.price !== null) integer(row.price, `${path}.price`, 0, MAX_PRICE);
    bool(row.enabled, `${path}.enabled`);
    integer(row.sortOrder, `${path}.sortOrder`, 0, 10000);
  });
  unique(pairings, "pairings");

  if (!isRecord(input.popup)) {
    add("popup", "object");
  } else {
    const popup = input.popup;
    bool(popup.enabled, "popup.enabled");
    const enabled = popup.enabled === true;
    l10n(popup.title, "popup.title", 60, enabled);
    l10n(popup.body, "popup.body", 240, enabled);
    image(popup.image, "popup.image");
    l10n(popup.ctaLabel, "popup.ctaLabel", 30, enabled);
    image(popup.ctaUrl, "popup.ctaUrl");
    if (enabled && popup.ctaUrl === "") add("popup.ctaUrl", "required");
    integer(popup.delaySeconds, "popup.delaySeconds", 1, 20);
  }

  const categoryIds = new Set(categories.filter(isRecord).map((row) => row.id));
  const addOnIds = new Set(addOns.filter(isRecord).map((row) => row.id));
  const productIds = new Set(products.filter(isRecord).map((row) => row.id));
  products.forEach((row, index) => {
    if (!isRecord(row)) return;
    if (!categoryIds.has(row.categoryId)) add(`products.${index}.categoryId`, "unknown_category");
    for (const field of ["baristaAddOns", "excludedAddOns"] as const) {
      if (isList(row[field]) && row[field].some((id) => !addOnIds.has(id))) add(`products.${index}.${field}`, "unknown_addon");
    }
    if (isList(row.oftenOrderedWith) && row.oftenOrderedWith.some((id) => !productIds.has(id))) {
      add(`products.${index}.oftenOrderedWith`, "unknown_product");
    }
  });
  signatures.forEach((id, index) => {
    if (!productIds.has(id)) add(`signatures.${index}`, "unknown_product");
  });
  pairings.forEach((row, index) => {
    if (!isRecord(row) || !isList(row.items)) return;
    if (row.items.some((id) => !productIds.has(id))) add(`pairings.${index}.items`, "unknown_product");
  });

  return issues;
}

export function isMenuData(value: unknown): value is MenuData {
  return validateMenu(value).length === 0;
}
