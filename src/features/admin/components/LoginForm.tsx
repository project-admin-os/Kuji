import { useId, useState, type RefObject } from "react";
import { Icon } from "@/shared/icons";

const styles = {
  form: "flex flex-col gap-4",
  field: "flex flex-col gap-2",
  label: "text-small font-bold",
  control:
    "text-body min-h-12 w-full rounded-lg border border-navy/15 bg-white px-4 py-3 read-only:opacity-70 focus:border-navy focus:outline-none",
  passwordWrap: "relative",
  passwordControl: "pe-14",
  toggle:
    "absolute end-0 top-0 inline-flex size-12 items-center justify-center rounded-full text-navy/65 transition hover:text-navy active:scale-95",
  toggleIcon: "size-5",
  submit:
    "text-small mt-1 min-h-12 rounded-full bg-navy px-6 text-center font-bold text-white transition hover:bg-navy/90 active:scale-[0.98] disabled:opacity-40",
};

interface LoginFormProps {
  values: { username: string; password: string };
  onChange: (field: "username" | "password", value: string) => void;
  onSubmit: () => void;
  limits: { username: number; password: number };
  labels: {
    username: string;
    password: string;
    showPassword: string;
    hidePassword: string;
    submit: string;
  };
  passwordRef: RefObject<HTMLInputElement | null>;
  busy: boolean;
  canSubmit: boolean;
}

export function LoginForm({
  values,
  onChange,
  onSubmit,
  limits,
  labels,
  passwordRef,
  busy,
  canSubmit,
}: LoginFormProps) {
  const usernameId = useId();
  const passwordId = useId();
  const [visible, setVisible] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      aria-busy={busy}
      className={styles.form}
    >
      <div className={styles.field}>
        <label htmlFor={usernameId} className={styles.label}>
          {labels.username}
        </label>
        <input
          id={usernameId}
          name="username"
          type="text"
          value={values.username}
          onChange={(event) => onChange("username", event.target.value)}
          maxLength={limits.username}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          readOnly={busy}
          required
          dir="ltr"
          className={styles.control}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={passwordId} className={styles.label}>
          {labels.password}
        </label>
        <div dir="ltr" className={styles.passwordWrap}>
          <input
            id={passwordId}
            ref={passwordRef}
            name="password"
            type={visible ? "text" : "password"}
            value={values.password}
            onChange={(event) => onChange("password", event.target.value)}
            maxLength={limits.password}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            readOnly={busy}
            required
            className={`${styles.control} ${styles.passwordControl}`}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? labels.hidePassword : labels.showPassword}
            aria-pressed={visible}
            className={styles.toggle}
          >
            <Icon
              name={visible ? "eyeOff" : "eye"}
              className={styles.toggleIcon}
            />
          </button>
        </div>
      </div>

      <button type="submit" disabled={!canSubmit} className={styles.submit}>
        {labels.submit}
      </button>
    </form>
  );
}
