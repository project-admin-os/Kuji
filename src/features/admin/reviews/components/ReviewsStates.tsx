import { useLocale } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings } from "../data/strings";

const styles = {
  skeletonCard: "flex animate-pulse flex-col gap-2 rounded-lg border border-navy/10 bg-white p-4 motion-reduce:animate-none",
  skeletonRow: "bg-navy/10 rounded",
  skeletonRow1: "h-4 w-1/3",
  skeletonRow2: "h-4 w-full",
  skeletonRow3: "h-4 w-2/3",
  skeletonTableRow: "animate-pulse border-b border-navy/5 motion-reduce:animate-none",
  skeletonCell: "px-4 py-3",
  skeletonBar: "bg-navy/10 h-4 rounded w-3/4",
  empty: "flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center",
  emptyIcon: "flex size-14 items-center justify-center rounded-full bg-arctic text-navy",
  emptyTitle: "text-heading font-bold",
  emptyHint: "text-small max-w-xs text-navy/65 text-balance",
  errorHint: "text-small max-w-xs text-navy/65 text-balance",
  retryButton:
    "text-small mt-1 min-h-11 rounded-full bg-navy px-6 font-bold text-white transition hover:bg-navy/90 active:scale-[0.98]",
};

export function ReviewCardSkeleton() {
  return (
    <li className={styles.skeletonCard} aria-hidden="true">
      <div className={`${styles.skeletonRow} ${styles.skeletonRow1}`} />
      <div className={`${styles.skeletonRow} ${styles.skeletonRow2}`} />
      <div className={`${styles.skeletonRow} ${styles.skeletonRow3}`} />
    </li>
  );
}

export function ReviewRowSkeleton() {
  return (
    <tr className={styles.skeletonTableRow} aria-hidden="true">
      {[0, 1, 2, 3].map((column) => (
        <td key={column} className={styles.skeletonCell}>
          <div className={styles.skeletonBar} />
        </td>
      ))}
    </tr>
  );
}

export function ReviewsEmptyState() {
  const s = strings[useLocale()];
  return (
    <div className={styles.empty} role="status">
      <span className={styles.emptyIcon}>
        <Icon name="chat" className="size-7" />
      </span>
      <h2 className={styles.emptyTitle}>{s.emptyTitle}</h2>
      <p className={styles.emptyHint}>{s.emptyHint}</p>
    </div>
  );
}

// Every review on this page is pending deletion (Undo is still available).
export function ReviewsClearedState() {
  const s = strings[useLocale()];
  return (
    <div className={styles.empty} role="status">
      <span className={styles.emptyIcon}>
        <Icon name="trash" className="size-7" />
      </span>
      <h2 className={styles.emptyTitle}>{s.clearedTitle}</h2>
      <p className={styles.emptyHint}>{s.clearedHint}</p>
    </div>
  );
}

interface ReviewsErrorStateProps {
  onRetry: () => void;
}

export function ReviewsErrorState({ onRetry }: ReviewsErrorStateProps) {
  const s = strings[useLocale()];
  return (
    <div className={styles.empty} role="alert">
      <span className={styles.emptyIcon}>
        <Icon name="chat" className="size-7" />
      </span>
      <h2 className={styles.emptyTitle}>{s.errorTitle}</h2>
      <p className={styles.errorHint}>{s.errorHint}</p>
      <button type="button" onClick={onRetry} className={styles.retryButton}>
        {s.retry}
      </button>
    </div>
  );
}
