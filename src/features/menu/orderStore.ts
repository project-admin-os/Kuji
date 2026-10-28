import { useSyncExternalStore } from "react";
import { MAX_ORDER_QUANTITY } from "./config";
import type { ConfiguredProduct, OrderLine, PairingOrderLine, ProductOrderLine } from "./types";

export interface OrderSnapshot {
  lines: OrderLine[];
  note: string;
}

const listeners = new Set<() => void>();
let current: OrderSnapshot = { lines: [], note: "" };

function notify(): void {
  listeners.forEach((listener) => listener());
}

function update(next: OrderSnapshot): void {
  current = next;
  notify();
}

function stableId(parts: readonly string[]): string {
  return parts.join("|");
}

function configuredKey(item: ConfiguredProduct): string {
  return stableId([item.productId, item.sizeId ?? "", ...[...item.addOnIds].sort()]);
}

export function addProductOrder(productId: string, sizeId: string | null, addOnIds: string[]): void {
  const key = stableId(["product", productId, sizeId ?? "", ...[...addOnIds].sort()]);
  const existing = current.lines.find((line) => line.id === key);
  if (existing) {
    update({
      ...current,
      lines: current.lines.map((line) => line.id === key
        ? { ...line, quantity: Math.min(MAX_ORDER_QUANTITY, line.quantity + 1) }
        : line),
    });
    return;
  }
  const line: ProductOrderLine = { id: key, kind: "product", productId, sizeId, addOnIds: [...addOnIds], quantity: 1 };
  update({ ...current, lines: [...current.lines, line] });
}

export function addPairingOrder(pairingId: string, products: [ConfiguredProduct, ConfiguredProduct]): void {
  const key = stableId(["pairing", pairingId, configuredKey(products[0]), configuredKey(products[1])]);
  const existing = current.lines.find((line) => line.id === key);
  if (existing) {
    update({
      ...current,
      lines: current.lines.map((line) => line.id === key
        ? { ...line, quantity: Math.min(MAX_ORDER_QUANTITY, line.quantity + 1) }
        : line),
    });
    return;
  }
  const line: PairingOrderLine = {
    id: key,
    kind: "pairing",
    pairingId,
    products: [
      { ...products[0], addOnIds: [...products[0].addOnIds] },
      { ...products[1], addOnIds: [...products[1].addOnIds] },
    ],
    quantity: 1,
  };
  update({ ...current, lines: [...current.lines, line] });
}

export function setOrderQuantity(id: string, quantity: number): void {
  if (quantity <= 0) {
    removeOrderLine(id);
    return;
  }
  update({
    ...current,
    lines: current.lines.map((line) => line.id === id
      ? { ...line, quantity: Math.min(MAX_ORDER_QUANTITY, Math.floor(quantity)) }
      : line),
  });
}

export function removeOrderLine(id: string): void {
  update({ ...current, lines: current.lines.filter((line) => line.id !== id) });
}

export function setOrderNote(note: string): void {
  update({ ...current, note: note.slice(0, 300) });
}

export function clearOrder(): void {
  update({ lines: [], note: "" });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): OrderSnapshot {
  return current;
}

export function useOrder(): OrderSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
