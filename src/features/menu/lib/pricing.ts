import type { ConfiguredProduct, MenuData, MenuProduct, OrderLine } from "../types";
import { availableAddOns } from "./options";

export function isConfiguredProductAvailable(menu: MenuData, configured: ConfiguredProduct): boolean {
  const product = menu.products.find((candidate) => candidate.id === configured.productId);
  if (!product || !product.inStock) return false;
  if (product.sizes.length > 0 && !configured.sizeId) return false;
  if (configured.sizeId && !product.sizes.some((size) => size.id === configured.sizeId)) return false;
  const allowedAddOns = new Set(availableAddOns(product, menu).map((addOn) => addOn.id));
  return configured.addOnIds.every((id) => allowedAddOns.has(id));
}

export function getProductPrice(product: MenuProduct, sizeId?: string | null): number | null {
  if (sizeId) {
    const size = product.sizes.find((candidate) => candidate.id === sizeId);
    if (!size) return null;
    return size.mode === "standalone"
      ? size.value
      : product.price === null
        ? null
        : product.price + size.value;
  }
  if (product.price !== null) return product.price;
  const standalonePrices = product.sizes
    .filter((candidate) => candidate.mode === "standalone")
    .map((candidate) => candidate.value);
  return standalonePrices.length > 0 ? Math.min(...standalonePrices) : null;
}

export function getAddOnPrice(menu: MenuData, addOnIds: readonly string[]): number | null {
  let total = 0;
  for (const id of addOnIds) {
    const addOn = menu.addOns.find((candidate) => candidate.id === id && candidate.enabled);
    if (!addOn) return null;
    total += addOn.price;
  }
  return total;
}

export function getConfiguredPrice(menu: MenuData, configured: ConfiguredProduct): number | null {
  const product = menu.products.find((candidate) => candidate.id === configured.productId);
  if (!product || !isConfiguredProductAvailable(menu, configured)) return null;
  const base = getProductPrice(product, configured.sizeId);
  const extras = getAddOnPrice(menu, configured.addOnIds);
  return base === null || extras === null ? null : base + extras;
}

export function getPairingPrice(
  menu: MenuData,
  pairing: MenuData["pairings"][number],
  products: [ConfiguredProduct, ConfiguredProduct],
): number | null {
  const firstProduct = menu.products.find((candidate) => candidate.id === products[0].productId);
  const secondProduct = menu.products.find((candidate) => candidate.id === products[1].productId);
  if (
    !pairing.enabled
    || pairing.items[0] !== products[0].productId
    || pairing.items[1] !== products[1].productId
    || !firstProduct
    || !secondProduct
    || !isConfiguredProductAvailable(menu, products[0])
    || !isConfiguredProductAvailable(menu, products[1])
  ) return null;
  const first = getConfiguredPrice(menu, products[0]);
  const second = getConfiguredPrice(menu, products[1]);
  if (pairing.price === null) return first === null || second === null ? null : first + second;
  const firstExtras = getAddOnPrice(menu, products[0].addOnIds);
  const secondExtras = getAddOnPrice(menu, products[1].addOnIds);
  if (firstExtras === null || secondExtras === null) return null;

  const sizeAdjustment = (product: MenuProduct, selectedSizeId: string | null): number => {
    const selected = getProductPrice(product, selectedSizeId);
    const defaultSizeId = product.sizes[0]?.id ?? null;
    const defaultPrice = getProductPrice(product, defaultSizeId);
    return selected === null || defaultPrice === null ? 0 : selected - defaultPrice;
  };

  return pairing.price
    + sizeAdjustment(firstProduct, products[0].sizeId)
    + sizeAdjustment(secondProduct, products[1].sizeId)
    + firstExtras
    + secondExtras;
}

export function getLinePrice(menu: MenuData, line: OrderLine): number | null {
  if (line.kind === "product") {
    return getConfiguredPrice(menu, {
      productId: line.productId,
      sizeId: line.sizeId,
      addOnIds: line.addOnIds,
    });
  }
  const pairing = menu.pairings.find((candidate) => candidate.id === line.pairingId);
  if (!pairing || pairing.items[0] !== line.products[0].productId || pairing.items[1] !== line.products[1].productId) return null;
  return getPairingPrice(menu, pairing, line.products);
}
