import { useId } from "react";
import { useLocale } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings } from "../data/strings";
import { ReviewDetail } from "./ReviewDetail";
import { usePanelFocus } from "./hooks/usePanelFocus";
import type { ReviewItem } from "../types";

const styles = {
  panel:
    "animate-reveal-in flex h-full w-full max-w-sm shrink-0 flex-col overflow-y-auto border-s border-navy/10 bg-white outline-none",
  header: "sticky top-0 flex items-center justify-between gap-3 border-b border-navy/10 bg-white px-5 py-4",
  title: "text-heading font-bold",
  closeButton:
    "group inline-flex min-h-10 min-w-10 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/50",
  closeVisual: "pointer-events-none inline-flex size-8 items-center justify-center rounded-full bg-arctic transition group-hover:bg-arctic/80",
  closeIcon: "size-4",
  body: "px-5 py-5",
};

interface ReviewsPanelProps {
  review: ReviewItem;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  onDelete: () => void;
}

export function ReviewsPanel({ review, onClose, onPrev, onNext, canPrev, canNext, onDelete }: ReviewsPanelProps) {
  const s = strings[useLocale()];
  const titleId = useId();
  const panelRef = usePanelFocus(onClose);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={styles.panel}
    >
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>{s.detailTitle}</h2>
        <button type="button" onClick={onClose} aria-label={s.closeDetail} className={styles.closeButton}>
          <span className={styles.closeVisual}>
            <Icon name="close" className={styles.closeIcon} />
          </span>
        </button>
      </div>
      <div className={styles.body}>
        <ReviewDetail review={review} onPrev={onPrev} onNext={onNext} canPrev={canPrev} canNext={canNext} onDelete={onDelete} />
      </div>
    </div>
  );
}
