import { Icon } from "@/shared/icons";
import { useLocale } from "@/shared/i18n";
import { formatRelative } from "../lib/dates";
import { pluralize } from "../lib/plural";
import { strings } from "../data/strings";

const styles = {
  header: "flex flex-wrap items-center justify-between gap-3 px-4 pt-6 pb-2 lg:px-8",
  titleGroup: "flex flex-col gap-0.5",
  title: "text-title font-bold text-balance",
  meta: "text-small text-navy/65",
  refresh:
    "flex min-h-11 items-center gap-2 rounded-full border border-navy/15 bg-white px-4 text-small font-bold text-navy transition hover:bg-mist active:scale-[0.98] disabled:opacity-50",
  select:
    "flex min-h-11 items-center rounded-full border border-navy/15 bg-white px-4 text-small font-bold text-navy transition hover:bg-mist active:scale-[0.98] disabled:opacity-50 lg:hidden",
  actions: "flex items-center gap-2",
  spin: "animate-spin motion-reduce:animate-none",
};

interface ReviewsHeaderProps {
  total: number | null;
  lastUpdated: Date | null;
  isRefetching: boolean;
  onRefresh: () => void;
  onSelect: () => void; // enters selection mode (mobile)
  canSelect: boolean;
}

export function ReviewsHeader({ total, lastUpdated, isRefetching, onRefresh, onSelect, canSelect }: ReviewsHeaderProps) {
  const s = strings[useLocale()];
  const locale = useLocale();

  const countLabel =
    total === null ? null : pluralize(total, locale, s.reviewsCount);

  const updatedLabel = !lastUpdated
    ? null
    : Date.now() - lastUpdated.getTime() < 45_000
      ? s.updatedJustNow
      : s.updatedAgo.replace("{time}", formatRelative(lastUpdated, locale));

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>{s.title}</h1>
        <p className={styles.meta} role="status" aria-live="polite">
          {[countLabel, updatedLabel].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={onSelect} disabled={!canSelect} className={styles.select}>
          {s.select}
        </button>
        <button type="button" onClick={onRefresh} disabled={isRefetching} className={styles.refresh}>
          <Icon name="refresh" className={`size-4 ${isRefetching ? styles.spin : ""}`} />
          {isRefetching ? s.refreshing : s.refresh}
        </button>
      </div>
    </header>
  );
}
