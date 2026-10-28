import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@/shared/api";
import { useLocale } from "@/shared/i18n";
import { deleteReviews } from "../../../adminApi";
import { registerFlusher } from "../../../pendingFlush";
import type { ToastProps } from "../../../components/Toast";
import { UNDO_WINDOW_MS } from "../../config";
import { pluralize } from "../../lib/plural";
import { EMPTY_BATCH, flushable, hide, isFull, undo as undoBatch, wouldOverflow, type PendingBatch } from "../../lib/pendingDeletes";
import { strings } from "../../data/strings";
import type { ReviewItem } from "../../types";

// Sent ids stay hidden until a fetch made after the commit lands.
const IN_FLIGHT = -1;

interface Options {
  items: ReviewItem[];
  total: number | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useReviewDeletes({ items, total, lastUpdated, refresh }: Options) {
  const locale = useLocale();
  const s = strings[locale];

  const [batch, setBatchState] = useState<PendingBatch>(EMPTY_BATCH);
  const [locked, setLocked] = useState<ReadonlyMap<number, number>>(new Map());
  const [failed, setFailed] = useState<number[] | null>(null);

  const batchRef = useRef(batch);
  const timerRef = useRef<number | undefined>(undefined);
  const mountedRef = useRef(false);
  const refreshRef = useRef(refresh);
  const updatedRef = useRef(0);

  useEffect(() => {
    refreshRef.current = refresh;
    updatedRef.current = lastUpdated?.getTime() ?? 0;
  });

  const setBatch = useCallback((next: PendingBatch) => {
    batchRef.current = next;
    setBatchState(next);
  }, []);

  const setLockFor = useCallback((ids: number[], since: number | null) => {
    if (!mountedRef.current) return;
    setLocked((prev) => {
      const next = new Map(prev);
      ids.forEach((id) => (since === null ? next.delete(id) : next.set(id, since)));
      return next;
    });
  }, []);

  // Sends the ids. Never aborted: unmounting must not cancel a commit.
  const commit = useCallback(
    async (ids: number[]) => {
      setLockFor(ids, IN_FLIGHT);
      try {
        await deleteReviews(ids); // deleted < requested is still success
        setLockFor(ids, updatedRef.current);
        if (mountedRef.current) refreshRef.current();
      } catch (error) {
        if (!mountedRef.current) return;
        setLockFor(ids, null); // restore the reviews
        if (error instanceof ApiError && error.status === 401) return; // central handler
        setFailed(ids);
      }
    },
    [setLockFor],
  );

  const flush = useCallback((): Promise<void> => {
    window.clearTimeout(timerRef.current);
    const ids = flushable(batchRef.current);
    if (ids.length === 0) return Promise.resolve();
    setBatch(EMPTY_BATCH);
    return commit(ids);
  }, [commit, setBatch]);

  // Hide ids and (re)start the undo window. Entry point for single and bulk delete.
  const remove = useCallback(
    (ids: number[]) => {
      if (ids.length === 0) return;
      if (wouldOverflow(batchRef.current, ids)) void flush();
      const next = hide(batchRef.current, ids);
      setBatch(next);
      setFailed(null);
      window.clearTimeout(timerRef.current);
      if (isFull(next)) void flush();
      else timerRef.current = window.setTimeout(() => void flush(), UNDO_WINDOW_MS);
    },
    [flush, setBatch],
  );

  const undo = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setBatch(undoBatch());
  }, [setBatch]);

  const retry = useCallback(() => {
    if (!failed) return;
    setFailed(null);
    void commit(failed);
  }, [failed, commit]);

  // Flush on unmount (tab switch, logout) and let sign-out flush first.
  useEffect(() => {
    mountedRef.current = true;
    const unregister = registerFlusher(flush);
    return () => {
      mountedRef.current = false;
      unregister();
      void flush();
    };
  }, [flush]);

  // Drop sent ids once a post-commit fetch has landed.
  useEffect(() => {
    const now = lastUpdated?.getTime() ?? 0;
    setLocked((prev) => {
      const next = new Map(prev);
      prev.forEach((since, id) => {
        if (since !== IN_FLIGHT && since !== now) next.delete(id);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [lastUpdated]);

  // Ctrl/Cmd+Z undoes while the window is open (the dialogs trap Tab focus).
  const hasPending = batch.ids.length > 0;
  useEffect(() => {
    if (!hasPending) return;
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hasPending, undo]);

  const hidden = useMemo(() => new Set<number>([...batch.ids, ...locked.keys()]), [batch, locked]);
  const visibleItems = useMemo(
    () => (hidden.size === 0 ? items : items.filter((item) => !hidden.has(item.id))),
    [items, hidden],
  );
  const visibleTotal = total === null ? null : Math.max(0, total - hidden.size);

  const toast: ToastProps = hasPending
    ? { message: pluralize(batch.ids.length, locale, s.reviewsDeleted), action: { label: s.undo, onClick: undo } }
    : failed
      ? {
          message: pluralize(failed.length, locale, s.deleteFailed),
          tone: "error",
          action: { label: s.retry, onClick: retry },
          dismissLabel: s.dismiss,
          onDismiss: () => setFailed(null),
        }
      : { message: null };

  return { visibleItems, visibleTotal, remove, undo, flush, toast };
}
