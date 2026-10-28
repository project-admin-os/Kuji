import type { MenuData, OrderLine } from "../types";
import { getLinePrice } from "./pricing";

export function orderCount(lines: readonly OrderLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
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
