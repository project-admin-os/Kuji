import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { strings } from "./data/strings";
import { useLocale } from "@/shared/i18n";
import { Sheet } from "./components/Sheet";
import { useSheet } from "./components/hooks/useSheet";
import { ReviewsHeader } from "./components/ReviewsHeader";
import { ReviewCard } from "./components/ReviewCard";
import { ReviewsTable } from "./components/ReviewsTable";
import { ReviewsFooter } from "./components/ReviewsFooter";
import { ReviewDetail } from "./components/ReviewDetail";
import { ReviewsPanel } from "./components/ReviewsPanel";
import { SelectionBar } from "./components/SelectionBar";
import { BulkDeleteConfirm } from "./components/BulkDeleteConfirm";
import { Toast } from "../components/Toast";
import {
  ReviewCardSkeleton,
  ReviewRowSkeleton,
  ReviewsClearedState,
  ReviewsEmptyState,
  ReviewsErrorState,
} from "./components/ReviewsStates";
import { useReviews } from "./components/hooks/useReviews";
import { useReviewDeletes } from "./components/hooks/useReviewDeletes";
import { useSelection } from "./components/hooks/useSelection";
import { useReviewShortcuts } from "./components/hooks/useReviewShortcuts";
import { pluralize } from "./lib/plural";
import { usePerPage } from "./components/hooks/usePerPage";
import { useIsDesktop } from "./components/hooks/useIsDesktop";
import type { ReviewItem } from "./types";

const styles = {
  tab: "flex min-h-0 flex-1 flex-col",
  body: "min-h-0 flex-1 overflow-y-auto px-4 py-2 lg:px-8",
  list: "flex flex-col gap-3",
  row: "flex min-h-0 flex-1 lg:px-8 lg:pb-2",
  tableShell: "hidden min-h-0 flex-1 flex-col lg:flex",
  mobileShell: "lg:hidden",
  srOnly: "sr-only",
};

const SKELETON_COUNT = 6;

export function ReviewsTab() {
  const locale = useLocale();
  const s = strings[locale];
  const isDesktop = useIsDesktop();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = usePerPage();
  const [openId, setOpenId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null); // keyboard-active row (desktop)
  const [confirmIds, setConfirmIds] = useState<number[] | null>(null); // bulk delete awaiting confirmation
  const [paused, setPaused] = useState(false);
  const [swipeOpenId, setSwipeOpenId] = useState<number | null>(null); // the one revealed card

  const onPastEnd = useCallback((lastPage: number) => setPage(Math.max(1, lastPage)), []);
  const { status, items: loadedItems, meta, isRefetching, lastUpdated, refresh } = useReviews(page, perPage, onPastEnd, paused);

  // Pending deletes are hidden over the loaded items; nothing is removed until committed.
  const deletes = useReviewDeletes({ items: loadedItems, total: meta?.total ?? null, lastUpdated, refresh });
  const items = deletes.visibleItems;
  const visibleTotal = deletes.visibleTotal;

  // Selection is scoped to the visible page; refetches only prune it.
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const selection = useSelection(ids, confirmIds === null && openId === null);

  // Swipe: close the revealed card when selecting starts, the list changes, or on tap elsewhere.
  useEffect(() => setSwipeOpenId(null), [ids, selection.active]);
  useEffect(() => {
    if (swipeOpenId === null) return;
    function onPointerDown(event: PointerEvent) {
      if (!(event.target as HTMLElement).closest(`[data-swipe-id="${swipeOpenId}"]`)) setSwipeOpenId(null);
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [swipeOpenId]);

  // Stable callbacks keep the memoized cards from re-rendering together.
  const { enter: enterSelection, toggle: toggleSelected } = selection;
  const onSwipeOpenChange = useCallback(
    (id: number, open: boolean) => setSwipeOpenId((current) => (open ? id : current === id ? null : current)),
    [],
  );
  const onLongPress = useCallback(
    (id: number) => {
      enterSelection({ exitWhenEmpty: true }); // long-press entry also exits when emptied
      toggleSelected(id);
    },
    [enterSelection, toggleSelected],
  );

  // Never reshuffle the list under a user who is mid-selection.
  const selecting = selection.active || selection.count > 0;
  useEffect(() => setPaused(selecting), [selecting]);

  // If the open review disappeared after a refetch or page change, close gracefully.
  useEffect(() => {
    if (openId !== null && status === "ready" && !items.some((item) => item.id === openId)) {
      setOpenId(null);
    }
  }, [openId, items, status]);

  function changePage(next: number) {
    void deletes.flush();
    selection.exit();
    setOpenId(null);
    setPage(Math.max(1, next));
  }

  function changePerPage(next: typeof perPage) {
    void deletes.flush();
    selection.exit();
    setOpenId(null);
    setPerPage(next);
    setPage(1);
  }

  const openIndex = openId === null ? -1 : items.findIndex((item) => item.id === openId);
  const openReview = openIndex === -1 ? null : items[openIndex];

  function openAt(index: number) {
    const target = items[index];
    if (target) setOpenId(target.id);
  }

  // Delete: if it is the open review, move to the next one (or close when none).
  function deleteReview(id: number) {
    if (id === openId) {
      const next = items[openIndex + 1];
      setOpenId(next ? next.id : null);
    }
    deletes.remove([id]);
  }

  const canPrev = openIndex > 0;
  const canNext = openIndex !== -1 && openIndex < items.length - 1;
  const goPrev = () => canPrev && openAt(openIndex - 1);
  const goNext = () => canNext && openAt(openIndex + 1);

  const deleteRef = useRef(deleteReview);
  useEffect(() => {
    deleteRef.current = deleteReview;
  });
  const onSwipeDelete = useCallback((id: number) => deleteRef.current(id), []);

  function focusRow(id: number) {
    document.querySelector<HTMLElement>(`[data-review-id="${id}"]`)?.focus();
  }

  // Delete the selection: one review follows the single flow, 2+ ask first.
  function requestBulkDelete() {
    const picked = [...selection.selected];
    if (picked.length === 0) return;
    if (picked.length === 1) {
      selection.exit();
      deleteReview(picked[0]);
    } else setConfirmIds(picked);
  }

  function confirmBulkDelete() {
    if (confirmIds) deletes.remove(confirmIds);
    setConfirmIds(null);
    selection.exit();
  }

  // Desktop keyboard: rows follow focus, the panel (when open) steps through reviews.
  useReviewShortcuts({
    enabled: isDesktop && confirmIds === null,
    panelOpen: Boolean(openReview),
    hasSelection: selection.count > 0,
    move: (delta) => {
      if (openReview) return delta > 0 ? goNext() : goPrev();
      const index = activeId === null ? -1 : items.findIndex((item) => item.id === activeId);
      const target = items[Math.min(items.length - 1, Math.max(0, index + delta))];
      if (target) focusRow(target.id);
    },
    toggleActive: (range) => {
      if (activeId !== null) selection.toggle(activeId, range);
    },
    deleteCurrent: () => {
      if (selection.count > 0) return requestBulkDelete();
      const id = openId ?? activeId;
      const index = items.findIndex((item) => item.id === id);
      if (id === null || index === -1) return;
      const neighbour = items[index + 1] ?? items[index - 1];
      deleteReview(id);
      if (!openReview && neighbour) requestAnimationFrame(() => focusRow(neighbour.id));
    },
    selectAll: selection.selectAll,
    clearSelection: selection.clear,
  });

  const showSkeleton = status === "loading" && items.length === 0;
  const showError = status === "error" && items.length === 0;
  const allPending = status === "ready" && loadedItems.length > 0 && items.length === 0;
  const showCleared = allPending && (visibleTotal ?? 0) > 0;
  const showEmpty = status === "ready" && items.length === 0 && !showCleared;
  const showData = items.length > 0;

  // Background is inert to assistive tech while a detail surface is open.
  const bgHidden = Boolean(openReview) || undefined;

  return (
    <section className={styles.tab} aria-busy={isRefetching}>
      <div aria-hidden={!isDesktop && bgHidden}>
        {!isDesktop && selection.active ? (
          <SelectionBar
            count={selection.count}
            allSelected={selection.state === "all"}
            showSelectAll
            cancelLabel={s.cancel}
            onSelectAll={selection.selectAll}
            onDelete={requestBulkDelete}
            onCancel={selection.exit}
          />
        ) : (
          <ReviewsHeader
            total={visibleTotal}
            lastUpdated={lastUpdated}
            isRefetching={isRefetching}
            onRefresh={refresh}
            onSelect={() => selection.enter()}
            canSelect={items.length > 0}
          />
        )}
        {isDesktop && selection.count > 0 && (
          <SelectionBar
            count={selection.count}
            allSelected={selection.state === "all"}
            showSelectAll={false}
            cancelLabel={s.deselect}
            onSelectAll={selection.selectAll}
            onDelete={requestBulkDelete}
            onCancel={selection.clear}
          />
        )}
      </div>

      <p className={styles.srOnly} role="status" aria-live="polite">
        {selection.count > 0 ? pluralize(selection.count, locale, s.selectedCount) : ""}
      </p>

      {showError && <ReviewsErrorState onRetry={refresh} />}
      {showEmpty && <ReviewsEmptyState />}
      {showCleared && <ReviewsClearedState />}

      {(showSkeleton || showData) && (
        <>
          {/* Mobile: card list */}
          <div aria-hidden={bgHidden} onScroll={() => setSwipeOpenId(null)} className={`${styles.body} ${styles.mobileShell}`}>
            <ul className={styles.list} aria-label={s.title}>
              {showSkeleton
                ? Array.from({ length: SKELETON_COUNT }, (_, index) => <ReviewCardSkeleton key={index} />)
                : items.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onOpen={setOpenId}
                      selecting={selection.active}
                      selected={selection.selected.has(review.id)}
                      onToggle={toggleSelected}
                      swipeOpen={swipeOpenId === review.id}
                      onSwipeOpenChange={onSwipeOpenChange}
                      onDelete={onSwipeDelete}
                      onLongPress={onLongPress}
                    />
                  ))}
            </ul>
          </div>

          {/* Desktop: dense table + side panel */}
          <div className={styles.row}>
            <div aria-hidden={isDesktop && bgHidden} className={styles.tableShell}>
              {showSkeleton ? (
                <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-navy/10 bg-white">
                  <table className="w-full border-collapse">
                    <tbody>
                      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                        <ReviewRowSkeleton key={index} />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <ReviewsTable
                  reviews={items}
                  selectedId={openId}
                  onOpen={setOpenId}
                  onDelete={deleteReview}
                  selected={selection.selected}
                  selectionState={selection.state}
                  onToggle={selection.toggle}
                  onToggleAll={() => (selection.state === "all" ? selection.clear() : selection.selectAll())}
                  onActivate={setActiveId}
                />
              )}
            </div>

            {isDesktop && openReview && (
              <ReviewsPanel
                review={openReview}
                onClose={() => setOpenId(null)}
                onPrev={goPrev}
                onNext={goNext}
                canPrev={canPrev}
                canNext={canNext}
                onDelete={() => deleteReview(openReview.id)}
              />
            )}
          </div>
        </>
      )}

      {meta && (showData || showCleared) && (
        <div aria-hidden={!isDesktop && bgHidden}>
          <ReviewsFooter meta={{ ...meta, total: visibleTotal ?? meta.total }} shown={items.length} onPageChange={changePage} onPerPageChange={changePerPage} />
        </div>
      )}

      {!isDesktop && openReview && (
        <MobileReviewSheet
          review={openReview}
          title={s.detailTitle}
          closeLabel={s.closeDetail}
          onClose={() => setOpenId(null)}
          onPrev={goPrev}
          onNext={goNext}
          canPrev={canPrev}
          canNext={canNext}
          onDelete={() => deleteReview(openReview.id)}
        />
      )}

      {confirmIds && (
        <BulkDeleteConfirm count={confirmIds.length} onConfirm={confirmBulkDelete} onCancel={() => setConfirmIds(null)} />
      )}

      <Toast {...deletes.toast} />
    </section>
  );
}

// Mounted only while a review is open on mobile, so useSheet's focus-trap and
// scroll-lock effects start and stop with the sheet instead of running always.
interface MobileReviewSheetProps {
  review: ReviewItem;
  title: string;
  closeLabel: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  onDelete: () => void;
}

function MobileReviewSheet({ review, title, closeLabel, onClose, onPrev, onNext, canPrev, canNext, onDelete }: MobileReviewSheetProps) {
  const sheet = useSheet(onClose);
  return (
    <Sheet title={title} closeLabel={closeLabel} sheet={sheet}>
      <ReviewDetail review={review} onPrev={onPrev} onNext={onNext} canPrev={canPrev} canNext={canNext} onDelete={onDelete} />
    </Sheet>
  );
}
