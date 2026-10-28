import { Icon, type IconName } from "@/shared/icons";

const styles = {
  card: "flex w-full items-center gap-4 rounded-lg border border-white/70 bg-white/80 px-4 py-4 text-start transition hover:bg-white active:scale-[0.98]",
  iconBubble: "flex size-12 shrink-0 items-center justify-center rounded-full bg-yellow text-navy",
  icon: "size-6",
  textColumn: "min-w-0 flex-1",
  title: "text-heading block font-bold text-balance",
  hint: "text-small block text-balance text-navy/65",
  arrow: "size-5 shrink-0 opacity-70",
};

interface ChoiceCardProps {
  icon: IconName;
  title: string;
  hint: string;
  onClick: () => void;
}

export function ChoiceCard({ icon, title, hint, onClick }: ChoiceCardProps) {
  return (
    <button type="button" onClick={onClick} className={styles.card}>
      <span className={styles.iconBubble}>
        <Icon name={icon} className={styles.icon} />
      </span>
      <span className={styles.textColumn}>
        <span className={styles.title}>{title}</span>
        <span className={styles.hint}>{hint}</span>
      </span>
      <Icon name="arrow" className={styles.arrow} />
    </button>
  );
}
