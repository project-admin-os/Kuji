interface LanguageToggleProps {
  label: string;
  ariaLabel: string;
  lang: string;
  onClick: () => void;
}

const styles = {
  button:
    'animate-fade-in text-small rounded-full border border-white/70 bg-white/80 px-4 py-2 font-bold transition active:scale-[0.98] hover:bg-white',
};

export function LanguageToggle({ label, ariaLabel, lang, onClick }: LanguageToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      lang={lang}
      className={styles.button}
    >
      {label}
    </button>
  );
}
