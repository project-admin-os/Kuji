import { useEffect, useRef } from "react";
import { useLocale } from "@/shared/i18n";
import { pluralize } from "../lib/plural";
import { strings } from "../data/strings";
import { Sheet } from "./Sheet";
import { useSheet } from "./hooks/useSheet";
import { usePanelFocus } from "./hooks/usePanelFocus";
import { useIsDesktop } from "./hooks/useIsDesktop";

const styles = {
  overlay: "fixed inset-0 z-50 flex items-center justify-center p-4",
  scrim: "animate-fade-in absolute inset-0 bg-scrim",
  dialog:
    "animate-pop-in relative flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white p-6 shadow-sheet outline-none motion-reduce:animate-none",
  title: "text-heading font-bold text-balance",
  hint: "text-small text-navy/70",
  actions: "flex flex-col-reverse gap-2 pt-2 lg:flex-row lg:justify-end",
  cancel:
    "text-small min-h-11 rounded-full border border-navy/15 px-5 font-bold text-navy transition hover:bg-mist active:scale-[0.98]",
  confirm:
    "text-small min-h-11 rounded-full bg-error px-5 font-bold text-white transition hover:bg-error/90 active:scale-[0.98]",
};

interface BulkDeleteConfirmProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

// Bottom sheet on mobile, centered dialog on desktop. Focus starts on Cancel.
export function BulkDeleteConfirm(props: BulkDeleteConfirmProps) {
  return useIsDesktop() ? <ConfirmDialog {...props} /> : <ConfirmSheet {...props} />;
}

function Body({ count, onConfirm, onCancel, cancelRef }: BulkDeleteConfirmProps & { cancelRef: React.RefObject<HTMLButtonElement | null> }) {
  const locale = useLocale();
  const s = strings[locale];
  return (
    <>
      <p className={styles.hint}>{s.bulkConfirmHint}</p>
      <div className={styles.actions}>
        <button ref={cancelRef} type="button" onClick={onCancel} className={styles.cancel}>
          {s.cancel}
        </button>
        <button type="button" onClick={onConfirm} className={styles.confirm}>
          {pluralize(count, locale, s.deleteCount)}
        </button>
      </div>
    </>
  );
}

function ConfirmSheet(props: BulkDeleteConfirmProps) {
  const locale = useLocale();
  const s = strings[locale];
  const cancelRef = useRef<HTMLButtonElement>(null);
  const sheet = useSheet(props.onCancel);
  useEffect(() => cancelRef.current?.focus({ preventScroll: true }), []);

  return (
    <Sheet title={pluralize(props.count, locale, s.bulkConfirmTitle)} closeLabel={s.cancel} sheet={sheet}>
      <div className="flex flex-col gap-4 pb-3">
        <Body {...props} onCancel={sheet.requestClose} cancelRef={cancelRef} />
      </div>
    </Sheet>
  );
}

function ConfirmDialog(props: BulkDeleteConfirmProps) {
  const locale = useLocale();
  const s = strings[locale];
  const cancelRef = useRef<HTMLButtonElement>(null);
  const panelRef = usePanelFocus(props.onCancel);
  useEffect(() => cancelRef.current?.focus({ preventScroll: true }), []);

  return (
    <div className={styles.overlay}>
      <div aria-hidden="true" onClick={props.onCancel} className={styles.scrim} />
      <div ref={panelRef} role="alertdialog" aria-modal="true" aria-label={pluralize(props.count, locale, s.bulkConfirmTitle)} tabIndex={-1} className={styles.dialog}>
        <h2 className={styles.title}>{pluralize(props.count, locale, s.bulkConfirmTitle)}</h2>
        <Body {...props} cancelRef={cancelRef} />
      </div>
    </div>
  );
}
