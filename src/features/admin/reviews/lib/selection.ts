// Pure selection model over the ids of the current page.

export type Selection = ReadonlySet<number>;
export type SelectionState = "none" | "some" | "all";

export const EMPTY_SELECTION: Selection = new Set<number>();

export function toggleId(selection: Selection, id: number): Selection {
  const next = new Set(selection);
  if (!next.delete(id)) next.add(id);
  return next;
}

export function selectAll(ids: readonly number[]): Selection {
  return new Set(ids);
}

export function clearSelection(): Selection {
  return EMPTY_SELECTION;
}

// Adds every id between anchor and target (inclusive) in list order (Shift-click).
export function selectRange(
  selection: Selection,
  ids: readonly number[],
  anchor: number,
  target: number,
): Selection {
  const from = ids.indexOf(anchor);
  const to = ids.indexOf(target);
  if (from === -1 || to === -1) return toggleId(selection, target);
  const [start, end] = from < to ? [from, to] : [to, from];
  const next = new Set(selection);
  for (let index = start; index <= end; index++) next.add(ids[index]);
  return next;
}

// Keeps only ids that still exist; never adds anything.
export function pruneSelection(selection: Selection, ids: readonly number[]): Selection {
  if (selection.size === 0) return selection;
  const existing = new Set(ids);
  const kept = [...selection].filter((id) => existing.has(id));
  return kept.length === selection.size ? selection : new Set(kept);
}

export function selectionState(selection: Selection, ids: readonly number[]): SelectionState {
  if (selection.size === 0 || ids.length === 0) return "none";
  return ids.every((id) => selection.has(id)) ? "all" : "some";
}
