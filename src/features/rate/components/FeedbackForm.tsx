import { Field } from "./Field";

const styles = {
  form: "flex flex-col gap-4 pb-2",
  control:
    "text-body w-full rounded-lg border border-navy/15 bg-white px-4 py-3 placeholder:text-navy/40 focus:border-navy focus:outline-none",
  textarea: "min-h-32 resize-y",
  error: "text-small rounded-lg border border-error/30 bg-error/10 px-4 py-3 font-bold text-error",
  submit:
    "text-small mt-1 min-h-12 rounded-full bg-navy px-6 font-bold text-white transition hover:bg-navy/90 active:scale-[0.98] disabled:opacity-40",
  honeypot: "sr-only",
};

interface FeedbackFormProps {
  values: { message: string; name: string; contact: string; website: string };
  onChange: (field: "message" | "name" | "contact" | "website", value: string) => void;
  onSubmit: () => void;
  limits: { note: number; name: number; contact: number };
  labels: {
    note: string;
    name: string;
    contact: string;
    submit: string;
    error: string;
  };
  noteHint?: string;
  canSubmit: boolean;
  hasError: boolean;
}

export function FeedbackForm({
  values,
  onChange,
  onSubmit,
  limits,
  labels,
  noteHint,
  canSubmit,
  hasError,
}: FeedbackFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className={styles.form}
    >
      <Field label={labels.note} hint={noteHint}>
        <textarea
          value={values.message}
          onChange={(event) => onChange("message", event.target.value)}
          maxLength={limits.note}
          rows={5}
          dir="auto"
          required
          className={`${styles.control} ${styles.textarea}`}
        />
      </Field>

      <Field label={labels.name}>
        <input
          type="text"
          value={values.name}
          onChange={(event) => onChange("name", event.target.value)}
          maxLength={limits.name}
          autoComplete="name"
          dir="auto"
          className={styles.control}
        />
      </Field>

      <Field label={labels.contact}>
        <input
          type="text"
          value={values.contact}
          onChange={(event) => onChange("contact", event.target.value)}
          maxLength={limits.contact}
          inputMode="email"
          autoComplete="email"
          dir="auto"
          className={styles.control}
        />
      </Field>

      <input
        type="text"
        name="website"
        value={values.website}
        onChange={(event) => onChange("website", event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className={styles.honeypot}
      />

      {hasError && (
        <p role="alert" className={styles.error}>
          {labels.error}
        </p>
      )}

      <button type="submit" disabled={!canSubmit} className={styles.submit}>
        {labels.submit}
      </button>
    </form>
  );
}
