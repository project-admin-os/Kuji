import { useEffect, useId, useRef } from "react";

interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmActionDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmActionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} aria-describedby={messageId} onCancel={(event) => { event.preventDefault(); onCancel(); }} onClick={(event) => { if (event.target === dialogRef.current) onCancel(); }} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border-0 bg-white p-6 text-navy shadow-sheet backdrop:bg-scrim open:animate-pop-in motion-reduce:animate-none">
      <h2 id={titleId} className="text-heading font-bold text-balance">{title}</h2>
      <p id={messageId} className="mt-3 text-small text-navy/65">{message}</p>
      <div className="mt-6 flex flex-wrap-reverse gap-3">
        <button type="button" onClick={onCancel} className="min-h-11 flex-1 rounded-full border border-navy/15 px-4 text-small font-bold hover:bg-mist">{cancelLabel}</button>
        <button type="button" onClick={onConfirm} className="min-h-11 flex-1 rounded-full bg-error px-4 text-small font-bold text-white hover:bg-error/90">{confirmLabel}</button>
      </div>
    </dialog>
  );
}
