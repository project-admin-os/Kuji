import type { ReactNode } from "react";

const styles = {
  base: "text-small font-bold empty:hidden",
  error: "text-error",
  success: "text-success",
};

interface MessageProps {
  id?: string;
  tone: "error" | "success";
  children?: ReactNode;
}

// Always mounted so screen readers announce text that appears later.
export function Message({ id, tone, children }: MessageProps) {
  return (
    <p id={id} aria-live="polite" className={`${styles.base} ${styles[tone]}`}>
      {children}
    </p>
  );
}
