import { useId, type ReactNode } from "react";
import { Icon } from "@/shared/icons";
import type { SheetState } from "../components/hooks/useSheet";

const styles = {
  root: "fixed inset-0 z-50 flex items-end justify-center",
  scrim: "absolute inset-0 bg-scrim",
  panel:
    "relative flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-sheet bg-mist pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-sheet outline-none",
  handleZone:
    "flex h-12 w-full shrink-0 cursor-grab touch-none select-none items-center justify-center active:cursor-grabbing",
  handleBar: "h-1.5 w-10 rounded-full bg-navy/15",
  header: "flex shrink-0 items-start justify-between gap-4 px-6 pb-3",
  title: "text-title font-bold text-balance",
  closeButton:
    "group -mt-2 inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/50",
  closeVisual:
    "pointer-events-none inline-flex size-9 items-center justify-center rounded-full bg-arctic transition group-hover:bg-arctic/80 group-active:scale-95",
  closeIcon: "size-5",
  body: "min-h-0 overflow-y-auto overscroll-contain px-6 pb-2",
};

interface SheetProps {
  title: string;
  closeLabel: string;
  sheet: SheetState;
  children: ReactNode;
}

export function Sheet({ title, closeLabel, sheet, children }: SheetProps) {
  const titleId = useId();

  const {
    panelRef,
    closing,
    dismissed,
    dragging,
    offset,
    handleProps,
    onExited,
    requestClose,
  } = sheet;

  const scrimMotion = dismissed ? "animate-scrim-out" : "animate-scrim-in";
  const panelMotion = closing ? "animate-slide-down" : "animate-slide-up";
  const panelSettle = dragging ? "" : "transition-transform";

  return (
    <div className={styles.root}>
      <div
        aria-hidden="true"
        onClick={requestClose}
        className={`${styles.scrim} ${scrimMotion}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onAnimationEnd={onExited}
        style={
          offset > 0 ? { transform: `translateY(${offset}px)` } : undefined
        }
        className={`${styles.panel} ${panelMotion} ${panelSettle}`}
      >
        <div {...handleProps} aria-hidden="true" className={styles.handleZone}>
          <span className={styles.handleBar} />
        </div>
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label={closeLabel}
            className={styles.closeButton}
          >
            <span className={styles.closeVisual}>
              <Icon name="close" className={styles.closeIcon} />
            </span>
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
