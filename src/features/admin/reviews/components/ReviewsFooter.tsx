import { useLocale } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { pageRange } from "../lib/pagination";
import { strings } from "../data/strings";
import { PER_PAGE_OPTIONS, type PerPage } from "../config";
import type { ReviewsMeta } from "../types";

const styles = {
  footer: "flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 px-4 py-3 lg:px-8",
  range: "text-small text-navy/65",
  nav: "flex items-center gap-1",
  navButton:
    "flex size-11 items-center justify-center rounded-full text-navy transition hover:bg-mist active:scale-[0.98] disabled:opacity-30 disabled:hover:bg-transparent",
  prevIcon: "size-5 rotate-180 rtl:rotate-0",
  nextIcon: "size-5 rtl:rotate-180",
  pageButton:
    "hidden size-11 shrink-0 items-center justify-center rounded-full text-small font-bold transition hover:bg-mist active:scale-[0.98] lg:flex",
  pageButtonActive: "bg-navy text-white hover:bg-navy/90",
  ellipsis: "hidden size-11 shrink-0 items-center justify-center text-small text-navy/40 lg:flex",
  perPage: "flex items-center gap-2 text-small text-navy/65",
  select: "min-h-9 rounded-md border border-navy/15 bg-white px-2 text-small font-bold text-navy",
};

interface ReviewsFooterProps {
  meta: ReviewsMeta;
  shown: number; // reviews visible on this page (pending deletes excluded)
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: PerPage) => void;
}

export function ReviewsFooter({ meta, shown, onPageChange, onPerPageChange }: ReviewsFooterProps) {
  const locale = useLocale();
  const s = strings[locale];
  const { page, perPage, total, totalPages } = meta;

  const from = total === 0 || shown === 0 ? 0 : (page - 1) * perPage + 1;
  const to = shown === 0 ? 0 : Math.min(from + shown - 1, total);

  return (
    <footer className={styles.footer}>
      <p className={styles.range}>{s.showingRange.replace("{from}", String(from)).replace("{to}", String(to)).replace("{total}", String(total))}</p>

      <nav className={styles.nav} aria-label={s.title}>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={s.previous}
          className={styles.navButton}
        >
          <Icon name="arrow" className={styles.prevIcon} />
        </button>

        {pageRange(page, totalPages).map((token, index) =>
          token === "ellipsis" ? (
            <span key={`e${index}`} className={styles.ellipsis}>…</span>
          ) : (
            <button
              key={token}
              type="button"
              onClick={() => onPageChange(token)}
              aria-current={token === page ? "page" : undefined}
              className={`${styles.pageButton} ${token === page ? styles.pageButtonActive : ""}`}
            >
              {token}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={s.next}
          className={styles.navButton}
        >
          <Icon name="arrow" className={styles.nextIcon} />
        </button>
      </nav>

      <label className={styles.perPage}>
        {s.perPageLabel}
        <select
          value={perPage}
          onChange={(event) => onPerPageChange(Number(event.target.value) as PerPage)}
          className={styles.select}
        >
          {PER_PAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </footer>
  );
}
