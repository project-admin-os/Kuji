import { Icon } from "@/shared/icons";

const styles = {
  wrapper: "flex flex-col items-center gap-4 py-6 text-center",
  iconBubble: "flex size-14 items-center justify-center rounded-full bg-success text-white",
  icon: "size-7",
  message: "text-heading font-bold text-balance",
  button:
    "text-small mt-2 min-h-12 rounded-full bg-navy px-8 font-bold text-white transition hover:bg-navy/90 active:scale-[0.98]",
};

interface ThankYouProps {
  message: string;
  closeLabel: string;
  onClose: () => void;
}

export function ThankYou({ message, closeLabel, onClose }: ThankYouProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.iconBubble}>
        <Icon name="check" className={styles.icon} />
      </span>
      <p className={styles.message}>{message}</p>
      <button type="button" onClick={onClose} className={styles.button}>
        {closeLabel}
      </button>
    </div>
  );
}
