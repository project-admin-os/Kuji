import { useEffect, useId, useRef } from "react";

const styles = {
  dialog:
    "m-auto w-[calc(100%-2rem)] max-w-sm rounded-sheet border-0 bg-white p-6 text-navy shadow-sheet backdrop:bg-scrim open:animate-pop-in motion-reduce:animate-none",
  body: "flex flex-col gap-2",
  title: "text-heading font-bold text-balance",
  text: "text-small text-navy/65",
  actions: "mt-6 flex gap-3",
  cancel:
    "text-small min-h-12 flex-1 rounded-full border border-navy/15 bg-white px-4 text-center font-bold transition hover:bg-mist active:scale-[0.98] disabled:opacity-40",
  confirm:
    "text-small min-h-12 flex-1 rounded-full bg-navy px-4 text-center font-bold text-white transition hover:bg-navy/90 active:scale-[0.98] disabled:opacity-60",
};

interface ConfirmDialogProps {
  open: boolean;
  busy: boolean;
  title: string;
  text: string;
  labels: { cancel: string; confirm: string; busy: string };
  onConfirm: () => void;
  onCancel: () => void;
}

// Native <dialog>: focus trap, Esc and focus return come for free.
export function ConfirmDialog({
  open,
  busy,
  title,
  text,
  labels,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const textId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={textId}
      onCancel={(event) => {
        event.preventDefault(); // we close it through state
        if (!busy) onCancel();
      }}
      onClick={(event) => {
        if (event.target === ref.current && !busy) onCancel(); // backdrop
      }}
      className={styles.dialog}
    >
      <div className={styles.body}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p id={textId} dir="auto" className={styles.text}>
          {text}
        </p>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={onCancel} disabled={busy} className={styles.cancel}>
          {labels.cancel}
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className={styles.confirm}>
          {busy ? labels.busy : labels.confirm}
        </button>
      </div>
    </dialog>
  );
}
