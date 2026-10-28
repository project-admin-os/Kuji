import { useId, type ReactNode } from "react";

const styles = {
  card: "flex flex-col gap-5 rounded-lg border border-white/70 bg-white/80 p-5 lg:p-6",
  heading: "flex flex-col gap-1",
  title: "text-heading font-bold text-balance",
  hint: "text-small text-navy/65",
};

interface SettingsCardProps {
  title: string;
  hint: string;
  children: ReactNode;
}

export function SettingsCard({ title, hint, children }: SettingsCardProps) {
  const titleId = useId();
  const hintId = useId();

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={hintId}
      className={styles.card}
    >
      <div className={styles.heading}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      </div>
      {children}
    </section>
  );
}
