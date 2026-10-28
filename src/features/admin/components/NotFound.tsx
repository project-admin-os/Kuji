import { handleInternalClick } from "@/shared/router";

const styles = {
  wrapper:
    "flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-10 text-center",
  title: "text-title font-bold text-balance",
  hint: "text-small max-w-xs text-navy/65 text-balance",
  link: "text-small inline-flex min-h-12 items-center rounded-full bg-navy px-8 font-bold text-white transition hover:bg-navy/90 active:scale-[0.98]",
};

interface NotFoundProps {
  title: string;
  hint: string;
  actionLabel: string;
  actionHref: string;
}

export function NotFound({ title, hint, actionLabel, actionHref }: NotFoundProps) {
  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.hint}>{hint}</p>
      <a href={actionHref} onClick={handleInternalClick} className={styles.link}>
        {actionLabel}
      </a>
    </section>
  );
}
