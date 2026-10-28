import { useLocale } from "@/shared/i18n";
import { useEffect, useRef } from "react";
import { Icon } from "@/shared/icons";
import { formatAbsolute, formatRelative, parseServerDate } from "../lib/dates";
import { strings } from "../data/strings";
import type { Selection, SelectionState } from "../lib/selection";
import type { ReviewItem } from "../types";

const styles = {
  wrapper: "min-h-0 flex-1 overflow-auto rounded-lg border border-navy/10 bg-white",
  table: "w-full border-collapse text-start",
  thead: "sticky top-0 z-10 bg-mist",
  th: "text-small border-b border-navy/10 px-4 py-3 text-start font-bold text-navy/70",
  row: "group cursor-pointer transition hover:bg-mist focus-visible:outline-none focus-visible:bg-mist focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy/40",
  rowSelected: "bg-arctic/40 hover:bg-arctic/40",
  td: "text-small border-b border-navy/5 px-4 py-3 align-top",
  name: "font-bold text-balance",
  message: "max-w-sm truncate text-navy/85",
  contact: "text-navy/65",
  time: "text-navy/65 whitespace-nowrap",
  actionCell: "w-14 text-end",
  deleteButton:
    "inline-flex size-9 items-center justify-center rounded-full text-error opacity-0 transition hover:bg-error/10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/50 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100",
  srOnly: "sr-only",
  checkCell: "w-12 text-center",
  checkbox: "size-5 cursor-pointer accent-navy focus-visible:outline-2 focus-visible:outline-navy/50",
  rowChecked: "bg-arctic/30",
};

interface ReviewsTableProps {
  reviews: ReviewItem[];
  selectedId: number | null;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
  selected: Selection;
  selectionState: SelectionState;
  onToggle: (id: number, range: boolean) => void;
  onToggleAll: () => void;
  onActivate: (id: number) => void; // keyboard-active row follows focus
}

export function ReviewsTable({ reviews, selectedId, onOpen, onDelete, selected, selectionState, onToggle, onToggleAll, onActivate }: ReviewsTableProps) {
  const locale = useLocale();
  const s = strings[locale];

  // Native indeterminate state for the header checkbox.
  const headRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headRef.current) headRef.current.indeterminate = selectionState === "some";
  }, [selectionState]);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th scope="col" className={`${styles.th} ${styles.checkCell}`}>
              <input
                ref={headRef}
                type="checkbox"
                checked={selectionState === "all"}
                aria-checked={selectionState === "some" ? "mixed" : selectionState === "all"}
                aria-label={s.selectAllRows}
                onChange={onToggleAll}
                className={styles.checkbox}
              />
            </th>
            <th scope="col" className={styles.th}>{s.columns.name}</th>
            <th scope="col" className={styles.th}>{s.columns.message}</th>
            <th scope="col" className={styles.th}>{s.columns.contact}</th>
            <th scope="col" className={styles.th}>{s.columns.date}</th>
            <th scope="col" className={`${styles.th} ${styles.actionCell}`}>
              <span className={styles.srOnly}>{s.actions}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => {
            const created = parseServerDate(review.created_at);
            const open = review.id === selectedId;
            const checked = selected.has(review.id);
            return (
              <tr
                key={review.id}
                tabIndex={0}
                role="button"
                aria-selected={checked}
                aria-current={open ? "true" : undefined}
                data-review-id={review.id}
                onFocus={() => onActivate(review.id)}
                onClick={() => onOpen(review.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && event.target === event.currentTarget) {
                    event.preventDefault();
                    onOpen(review.id);
                  }
                }}
                className={`${styles.row} ${open ? styles.rowSelected : checked ? styles.rowChecked : ""}`}
              >
                <td className={`${styles.td} ${styles.checkCell}`} onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={checked}
                    aria-label={s.selectReview}
                    onChange={() => {}}
                    onClick={(event) => onToggle(review.id, event.shiftKey)}
                    className={styles.checkbox}
                  />
                </td>
                <td className={`${styles.td} ${styles.name}`}>{review.name || s.anonymous}</td>
                <td className={`${styles.td} ${styles.message}`} title={review.message}>
                  {review.message}
                </td>
                <td className={`${styles.td} ${styles.contact}`}>{review.contact || "—"}</td>
                <td className={`${styles.td} ${styles.time}`} title={formatAbsolute(created, locale)}>
                  {formatRelative(created, locale)}
                </td>
                <td className={`${styles.td} ${styles.actionCell}`}>
                  <button
                    type="button"
                    aria-label={s.deleteReview}
                    title={s.delete}
                    className={styles.deleteButton}
                    onClick={(event) => {
                      event.stopPropagation();
                      // Keep keyboard focus in the list once the row is hidden.
                      const row = event.currentTarget.closest("tr");
                      const neighbour = (row?.nextElementSibling ?? row?.previousElementSibling) as HTMLElement | null;
                      onDelete(review.id);
                      requestAnimationFrame(() => neighbour?.focus({ preventScroll: true }));
                    }}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <Icon name="trash" className="size-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
