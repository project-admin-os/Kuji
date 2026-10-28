interface LanguageToggleProps {
  label: string;
  ariaLabel: string;
  lang: string;
  onClick: () => void;
}

const styles = {
  button:
    "group animate-fade-in inline-flex min-h-12 min-w-12 items-center justify-center rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",

  label:
    "pointer-events-none inline-flex min-h-9 min-w-9 w-fit items-center justify-center whitespace-nowrap rounded-full border border-white/70 bg-white/80 px-2 text-small font-medium transition group-hover:bg-white group-active:scale-[0.98]",
};

export function LanguageToggle({
  label,
  ariaLabel,
  lang,
  onClick,
}: LanguageToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      lang={lang}
      className={styles.button}
    >
      <span className={styles.label}>{label}</span>
    </button>
  );
}
