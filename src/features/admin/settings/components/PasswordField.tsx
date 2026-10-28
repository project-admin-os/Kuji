import { useId, useState, type RefObject } from "react";
import { Icon } from "@/shared/icons";
import { Message } from "./Message";

const styles = {
  field: "flex flex-col gap-2",
  label: "text-small font-bold",
  wrap: "relative",
  control:
    "text-body min-h-12 w-full rounded-lg border border-navy/15 bg-white py-3 ps-4 pe-14 read-only:opacity-70 focus:border-navy focus:outline-none disabled:opacity-50 aria-[invalid=true]:border-error",
  toggle:
    "absolute end-0 top-0 inline-flex size-12 items-center justify-center rounded-full text-navy/65 transition hover:text-navy active:scale-95",
  toggleIcon: "size-5",
};

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  maxLength: number;
  labels: { show: string; hide: string };
  error?: string | null;
  describedBy?: string;
  readOnly: boolean;
  disabled: boolean;
  enterKeyHint: "next" | "go";
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  maxLength,
  labels,
  error,
  describedBy,
  readOnly,
  disabled,
  enterKeyHint,
  inputRef,
}: PasswordFieldProps) {
  const inputId = useId();
  const errorId = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div dir="ltr" className={styles.wrap}>
        <input
          id={inputId}
          ref={inputRef}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint={enterKeyHint}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={[describedBy, errorId].filter(Boolean).join(" ")}
          className={styles.control}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? labels.hide : labels.show}
          aria-pressed={visible}
          className={styles.toggle}
        >
          <Icon name={visible ? "eyeOff" : "eye"} className={styles.toggleIcon} />
        </button>
      </div>
      <Message id={errorId} tone="error">
        {error}
      </Message>
    </div>
  );
}
