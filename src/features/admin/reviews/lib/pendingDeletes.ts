import { MAX_PENDING_DELETES } from "../config";

// Pure model of the pending (not yet sent) delete batch.
// No React and no timers: the hook owns the 5 s window and calls these.

export interface PendingBatch {
  readonly ids: readonly number[];
}

export const EMPTY_BATCH: PendingBatch = { ids: [] };

// Adds ids to the batch (duplicates ignored). Order of deletion is kept.
export function hide(batch: PendingBatch, ids: readonly number[]): PendingBatch {
  const seen = new Set(batch.ids);
  const added = ids.filter((id) => !seen.has(id) && (seen.add(id), true));
  return added.length === 0 ? batch : { ids: [...batch.ids, ...added] };
}

// Undo drops the whole batch: nothing was sent, so nothing needs reverting.
export function undo(): PendingBatch {
  return EMPTY_BATCH;
}

// The ids to send when the batch is committed.
export function flushable(batch: PendingBatch): number[] {
  return [...batch.ids];
}

export function isFull(batch: PendingBatch): boolean {
  return batch.ids.length >= MAX_PENDING_DELETES;
}

// True when adding these ids would push the batch past the server's limit.
export function wouldOverflow(batch: PendingBatch, ids: readonly number[]): boolean {
  return hide(batch, ids).ids.length > MAX_PENDING_DELETES;
}
