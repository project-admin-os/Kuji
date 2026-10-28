import { useId, useRef, useState } from "react";
import { useStrings } from "@/shared/i18n";
import { saveUsername } from "../../adminApi";
import { updateUser, type AdminUser } from "../../session";
import { SUCCESS_VISIBLE_MS, USERNAME_RULES } from "../config";
import { strings } from "../data/strings";
import { classifyError, type FieldCode } from "../lib/errors";
import { normalizeUsername, usernameIssue } from "../lib/username";
import { ConfirmDialog } from "./ConfirmDialog";
import { useFlash } from "./hooks/useFlash";
import { Message } from "./Message";
import { SettingsCard } from "./SettingsCard";

const styles = {
  form: "flex flex-col gap-5",
  field: "flex flex-col gap-2",
  label: "text-small font-bold",
  hint: "text-caption text-navy/65",
  control:
    "text-body min-h-12 w-full rounded-lg border border-navy/15 bg-white px-4 py-3 read-only:opacity-70 focus:border-navy focus:outline-none aria-[invalid=true]:border-error",
  submit:
    "text-small min-h-12 min-w-44 self-start rounded-full bg-navy px-8 text-center font-bold text-white transition hover:bg-navy/90 active:scale-[0.98] disabled:opacity-40",
};

export function UsernameCard({ user }: { user: AdminUser }) {
  const s = useStrings(strings);
  const usernameId = useId();
  const rulesId = useId();
  const errorId = useId();
  const [value, setValue] = useState(user.username);
  const [touched, setTouched] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverCode, setServerCode] = useState<FieldCode | null>(null);
  const [generic, setGeneric] = useState(false);
  const busyRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const flash = useFlash(SUCCESS_VISIBLE_MS);

  const issue = usernameIssue(value);
  const canSave = issue === null && value !== user.username && !saving;
  const error = serverCode
    ? s.errors[serverCode]
    : touched && issue
      ? s.usernameIssues[issue]
      : null;

  function handleChange(next: string) {
    setValue(normalizeUsername(next));
    setServerCode(null);
    setGeneric(false);
    flash.clear();
  }

  async function handleConfirm() {
    if (busyRef.current) return;
    busyRef.current = true;
    setSaving(true);
    try {
      const saved = await saveUsername(value);
      updateUser(saved); // the shell shows the new name right away
      setValue(saved.username);
      setTouched(false);
      flash.show();
    } catch (err) {
      const problem = classifyError(err);
      if (problem.kind === "field" && problem.field === "username") {
        setServerCode(problem.code);
        window.setTimeout(() => inputRef.current?.focus(), 0);
      } else if (problem.kind === "generic") {
        setGeneric(true);
      }
    } finally {
      setSaving(false);
      setConfirming(false);
      busyRef.current = false;
    }
  }

  return (
    <SettingsCard title={s.usernameTitle} hint={s.usernameHint}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canSave) setConfirming(true);
        }}
        className={styles.form}
      >
        <div className={styles.field}>
          <label htmlFor={usernameId} className={styles.label}>
            {s.newUsernameLabel}
          </label>
          <input
            id={usernameId}
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => handleChange(event.target.value)}
            onBlur={() => setTouched(true)}
            maxLength={USERNAME_RULES.max}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            readOnly={saving}
            aria-invalid={error ? true : undefined}
            aria-describedby={`${rulesId} ${errorId}`}
            dir="ltr"
            className={styles.control}
          />
          <p id={rulesId} className={styles.hint}>
            {s.usernameRules}
          </p>
          <Message id={errorId} tone="error">
            {error}
          </Message>
        </div>

        <Message tone={generic ? "error" : "success"}>
          {generic ? s.errors.generic : flash.visible ? s.usernameSaved : null}
        </Message>

        <button type="submit" disabled={!canSave} className={styles.submit}>
          {s.saveUsername}
        </button>
      </form>

      <ConfirmDialog
        open={confirming}
        busy={saving}
        title={s.usernameConfirmTitle}
        text={s.usernameConfirmBody.replace("{name}", value)}
        labels={{ cancel: s.cancel, confirm: s.usernameConfirmAction, busy: s.saving }}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setConfirming(false)}
      />
    </SettingsCard>
  );
}
