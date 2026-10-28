import { memo } from "react";
import { useLocale } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { formatAbsolute, formatRelative, parseServerDate } from "../lib/dates";
import { strings } from "../data/strings";
import { useSwipeRow } from "./hooks/useSwipeRow";
import { useLongPress } from "./hooks/useLongPress";
import type { ReviewItem } from "../types";

const styles = {
  item: "relative overflow-hidden rounded-lg",
  action:
    "text-small absolute inset-y-0 end-0 flex w-24 flex-col items-center justify-center gap-1 bg-error font-bold text-white",
  card: "relative flex min-h-11 w-full touch-pan-y select-none flex-col gap-2 rounded-lg border border-navy/10 bg-white p-4 text-start [-webkit-touch-callout:none]",
  top: "flex items-start justify-between gap-3",
  name: "text-small font-bold text-balance",
  time: "text-caption shrink-0 text-navy/55",
  message: "text-body line-clamp-3 text-navy/85 whitespace-pre-line",
  contact: "text-small text-navy/65",
  selected: "border-navy bg-arctic/40",
  check:
    "flex size-6 shrink-0 items-center justify-center rounded-full border border-navy/30 bg-white text-white",
  checkOn: "border-navy bg-navy",
  head: "flex items-start gap-3",
};

interface ReviewCardProps {
  review: ReviewItem;
  onOpen: (id: number) => void;
  selecting: boolean; // selection mode: taps toggle, swipe is off
  selected: boolean;
  onToggle: (id: number) => void;
  swipeOpen: boolean; // only one card is open at a time (owned by the list)
  onSwipeOpenChange: (id: number, open: boolean) => void;
  onDelete: (id: number) => void; // single-delete flow (hide + Undo toast)
  onLongPress: (id: number) => void; // enters selection mode and selects this card
}

// Memoized: all props are stable or per-card, so a drag elsewhere doesn't re-render it.
export const ReviewCard = memo(function ReviewCard({
  review,
  onOpen,
  selecting,
  selected,
  onToggle,
  swipeOpen,
  onSwipeOpenChange,
  onDelete,
  onLongPress,
}: ReviewCardProps) {
  const locale = useLocale();
  const s = strings[locale];
  const created = parseServerDate(review.created_at);
  const id = review.id;

  const swipe = useSwipeRow<HTMLButtonElement>({
    enabled: !selecting,
    open: swipeOpen,
    rtl: locale === "ar",
    onOpenChange: (open) => onSwipeOpenChange(id, open),
    onCommit: () => onDelete(id),
  });
  const press = useLongPress<HTMLButtonElement>(!selecting, () => onLongPress(id));

  return (
    <li className={styles.item} data-swipe-id={id}>
      {/* Revealed by swiping; only reachable while open (Delete also lives in the detail view). */}
      <button
        type="button"
        onClick={() => onDelete(id)}
        tabIndex={swipeOpen ? 0 : -1}
        aria-hidden={!swipeOpen}
        aria-label={s.deleteReview}
        className={styles.action}
      >
        <Icon name="trash" className="size-5" />
        {s.delete}
      </button>

      <button
        ref={swipe.ref}
        type="button"
        onClick={() => (selecting ? onToggle(id) : onOpen(id))}
        onClickCapture={(event) => {
          if (press.consumeFired()) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          swipe.onClickCapture(event);
        }}
        onPointerDown={(event) => {
          press.onPointerDown(event);
          swipe.onPointerDown(event);
        }}
        onPointerMove={(event) => {
          press.onPointerMove(event);
          swipe.onPointerMove(event);
        }}
        onPointerUp={() => {
          press.onPointerUp();
          swipe.onPointerUp();
        }}
        onPointerCancel={() => {
          press.onPointerCancel();
          swipe.onPointerCancel();
        }}
        onContextMenu={press.onContextMenu}
        aria-pressed={selecting ? selected : undefined}
        className={`${styles.card} ${selected ? styles.selected : ""}`}
      >
        <div className={styles.top}>
          <span className={styles.head}>
            {selecting && (
              <span className={`${styles.check} ${selected ? styles.checkOn : ""}`} aria-hidden="true">
                {selected && <Icon name="check" className="size-4" />}
              </span>
            )}
            <span className={styles.name}>{review.name || s.anonymous}</span>
          </span>
          <time className={styles.time} dateTime={review.created_at} title={formatAbsolute(created, locale)}>
            {formatRelative(created, locale)}
          </time>
        </div>
        <p className={styles.message}>{review.message}</p>
        {review.contact && <p className={styles.contact}>{review.contact}</p>}
      </button>
    </li>
  );
});
