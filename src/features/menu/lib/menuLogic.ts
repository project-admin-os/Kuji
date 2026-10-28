import type { MenuData, OrderLine } from "../types";
import { getLinePrice, isConfiguredProductAvailable } from "./pricing";

export function orderCount(lines: readonly OrderLine[]): number {
  return lines.reduce((total, line) => total + line.quantity * (line.kind === "pairing" ? 2 : 1), 0);
}

export function isOrderLineAvailable(menu: MenuData, line: OrderLine): boolean {
  if (line.kind === "product") {
    return isConfiguredProductAvailable(menu, {
      productId: line.productId,
      sizeId: line.sizeId,
      addOnIds: line.addOnIds,
    });
  }
  const pairing = menu.pairings.find((candidate) => candidate.id === line.pairingId);
  return Boolean(
    pairing?.enabled
    && pairing.items[0] === line.products[0].productId
    && pairing.items[1] === line.products[1].productId
    && line.products.every((configured) => isConfiguredProductAvailable(menu, configured)),
  );
}

export function orderTotal(menu: MenuData, lines: readonly OrderLine[]): number | null {
  let total = 0;
  for (const line of lines) {
    const price = getLinePrice(menu, line);
    if (price === null) return null;
    total += price * line.quantity;
  }
  return total;
}

export const countOrderItems = orderCount;
export const calculateOrderTotal = orderTotal;
