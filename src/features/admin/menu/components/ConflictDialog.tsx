import { useEffect, useId, useRef } from "react";
import type { MenuAdminStrings } from "../data/strings";

interface ConflictDialogProps {
  open: boolean;
  revision: number | null;
  copy: MenuAdminStrings;
  onReload: () => void;
  onKeepEditing: () => void;
}

export function ConflictDialog({ open, revision, copy, onReload, onKeepEditing }: ConflictDialogProps) {
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
    <dialog ref={ref} aria-labelledby={titleId} aria-describedby={textId} onCancel={(event) => { event.preventDefault(); onKeepEditing(); }} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border-0 bg-white p-6 text-navy shadow-sheet backdrop:bg-scrim open:animate-pop-in motion-reduce:animate-none">
      <div className="grid gap-3">
        <h2 id={titleId} className="text-heading font-bold text-balance">{copy.conflictTitle}</h2>
        <p id={textId} className="text-small text-navy/65">{copy.conflictText}</p>
        <p className="rounded-xl bg-mist px-3 py-2 text-caption font-semibold text-navy/70">{copy.serverRevision}: {revision ?? "—"}</p>
      </div>
      <div className="mt-6 flex flex-wrap-reverse gap-3">
        <button type="button" onClick={onKeepEditing} className="min-h-11 flex-1 rounded-full border border-navy/15 px-4 text-small font-bold hover:bg-mist">{copy.keepEditing}</button>
        <button type="button" onClick={onReload} className="min-h-11 flex-1 rounded-full bg-navy px-4 text-small font-bold text-white hover:bg-navy/90">{copy.reloadLatest}</button>
      </div>
    </dialog>
  );
}
