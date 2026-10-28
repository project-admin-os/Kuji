import type { ConfiguredProduct, MenuData, MenuProduct, OrderLine } from "../types";

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
  return product.price;
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
  if (!product) return null;
  const base = getProductPrice(product, configured.sizeId);
  const extras = getAddOnPrice(menu, configured.addOnIds);
  return base === null || extras === null ? null : base + extras;
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
  if (!pairing) return null;
  if (pairing.price !== null) return pairing.price;
  const first = getConfiguredPrice(menu, line.products[0]);
  const second = getConfiguredPrice(menu, line.products[1]);
  return first === null || second === null ? null : first + second;
}
