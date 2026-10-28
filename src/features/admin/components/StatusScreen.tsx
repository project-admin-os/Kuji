const styles = {
  screen: "flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center",
  spinner:
    "size-8 animate-spin rounded-full border-2 border-navy/15 border-t-navy motion-reduce:animate-none",
  text: "text-small font-bold text-balance",
  button:
    "text-small min-h-12 rounded-full bg-navy px-8 font-bold text-white transition hover:bg-navy/90 active:scale-[0.98]",
};

interface StatusScreenProps {
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function StatusScreen({ message, retryLabel, onRetry }: StatusScreenProps) {
  const failed = onRetry !== undefined;

  return (
    <main className={styles.screen}>
      {failed ? (
        <p role="alert" className={styles.text}>
          {message}
        </p>
      ) : (
        <>
          <span aria-hidden="true" className={styles.spinner} />
          <p role="status" className={styles.text}>
            {message}
          </p>
        </>
      )}
      {failed && (
        <button type="button" onClick={onRetry} className={styles.button}>
          {retryLabel}
        </button>
      )}
    </main>
  );
}
