import { Icon } from "@/shared/icons";

const styles = {
  region:
    "pointer-events-none fixed inset-x-4 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)] z-[60] flex justify-center lg:inset-x-auto lg:bottom-6 lg:start-[17.5rem] lg:justify-start",
  toast:
    "animate-pop-in pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-lg py-1.5 ps-4 pe-2 text-white shadow-sheet motion-reduce:animate-none lg:w-auto",
  tone: { default: "bg-navy", error: "bg-error" },
  message: "text-small flex-1 font-bold",
  action: "text-small min-h-11 shrink-0 rounded-full px-4 font-bold transition active:scale-[0.98]",
  actionTone: { default: "text-yellow hover:bg-white/10", error: "text-white hover:bg-white/15" },
  dismiss: "flex size-11 shrink-0 items-center justify-center rounded-full transition hover:bg-white/15",
};

export interface ToastProps {
  message: string | null;
  tone?: "default" | "error";
  action?: { label: string; onClick: () => void };
  dismissLabel?: string;
  onDismiss?: () => void;
}

// The live region stays mounted so screen readers announce each new message.
export function Toast({ message, tone = "default", action, dismissLabel, onDismiss }: ToastProps) {
  return (
    <div className={styles.region} role="status" aria-live="polite">
      {message && (
        <div className={`${styles.toast} ${styles.tone[tone]}`}>
          <p className={styles.message}>{message}</p>
          {action && (
            <button type="button" onClick={action.onClick} className={`${styles.action} ${styles.actionTone[tone]}`}>
              {action.label}
            </button>
          )}
          {onDismiss && (
            <button type="button" onClick={onDismiss} aria-label={dismissLabel} className={styles.dismiss}>
              <Icon name="close" className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
