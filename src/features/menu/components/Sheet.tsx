import type { ReactNode } from "react";
import { Icon } from "@/shared/icons";
import type { MenuStrings } from "../data/strings";
import { useSheet } from "./hooks/useSheet";

interface SheetProps {
  open: boolean;
  title: string;
  strings: MenuStrings;
  onClose: () => void;
  children: ReactNode;
  size?: "default" | "wide";
}

export function Sheet({ open, title, strings, onClose, children, size = "default" }: SheetProps) {
  const panelRef = useSheet(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-sheet-title"
        tabIndex={-1}
        className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-mist p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-navy shadow-2xl outline-none sm:rounded-3xl sm:p-7 ${size === "wide" ? "sm:max-w-3xl" : "sm:max-w-xl"}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="menu-sheet-title" className="text-title font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-navy transition hover:bg-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" aria-label={strings.close}>
            <Icon name="close" className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
