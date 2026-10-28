import { Icon, type IconName } from "@/shared/icons";

const styles = {
  wrapper:
    "flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-10 text-center",
  iconBubble: "flex size-14 items-center justify-center rounded-full bg-arctic text-navy",
  icon: "size-7",
  title: "text-title font-bold text-balance",
  hint: "text-small max-w-xs text-navy/65 text-balance",
  badge: "text-caption rounded-full bg-navy px-3 py-1 font-bold text-yellow",
};

interface TabPlaceholderProps {
  icon: IconName;
  title: string;
  hint: string;
  badge: string;
}

export function TabPlaceholder({ icon, title, hint, badge }: TabPlaceholderProps) {
  return (
    <section className={styles.wrapper}>
      <span className={styles.iconBubble}>
        <Icon name={icon} className={styles.icon} />
      </span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.hint}>{hint}</p>
      <span className={styles.badge}>{badge}</span>
    </section>
  );
}
