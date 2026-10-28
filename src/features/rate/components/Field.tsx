import type { ReactNode } from "react";

const styles = {
  field: "flex flex-col gap-2",
  label: "text-small font-bold",
  hint: "text-caption text-navy/65",
};

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  );
}
