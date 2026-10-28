import { useLocale } from "@/shared/i18n";
import { pluralize } from "../lib/plural";
import { strings } from "../data/strings";

const styles = {
  bar: "flex flex-wrap items-center gap-2 border-y border-navy/10 bg-arctic/40 px-4 py-2 lg:mx-8 lg:rounded-lg lg:border",
  count: "text-small me-auto font-bold",
  button:
    "text-small min-h-11 rounded-full px-4 font-bold text-navy transition hover:bg-arctic/60 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-transparent",
  danger:
    "text-small min-h-11 rounded-full bg-error px-4 font-bold text-white transition hover:bg-error/90 active:scale-[0.98] disabled:opacity-40",
};

interface SelectionBarProps {
  count: number;
  allSelected: boolean;
  showSelectAll: boolean; // mobile selection mode
  cancelLabel: string;
  onSelectAll: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function SelectionBar({ count, allSelected, showSelectAll, cancelLabel, onSelectAll, onDelete, onCancel }: SelectionBarProps) {
  const locale = useLocale();
  const s = strings[locale];

  return (
    <div className={styles.bar}>
      <p className={styles.count}>{pluralize(count, locale, s.selectedCount)}</p>
      {showSelectAll && (
        <button type="button" onClick={onSelectAll} disabled={allSelected} className={styles.button}>
          {s.selectAll}
        </button>
      )}
      <button type="button" onClick={onDelete} disabled={count === 0} className={styles.danger}>
        {s.delete}
      </button>
      <button type="button" onClick={onCancel} className={styles.button}>
        {cancelLabel}
      </button>
    </div>
  );
}
