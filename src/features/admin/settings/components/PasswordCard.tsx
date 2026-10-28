import { useId, useRef, useState } from "react";
import { useStrings } from "@/shared/i18n";
import { savePassword } from "../../adminApi";
import { LIMITS } from "../../config";
import { type AdminUser } from "../../session";
import { SUCCESS_VISIBLE_MS } from "../config";
import { strings } from "../data/strings";
import { classifyError, type FieldCode } from "../lib/errors";
import { checkPassword } from "../lib/password";
import { ConfirmDialog } from "./ConfirmDialog";
import { useFlash } from "./hooks/useFlash";
import { Message } from "./Message";
import { PasswordField } from "./PasswordField";
import { PasswordRules } from "./PasswordRules";
import { SettingsCard } from "./SettingsCard";

const styles = {
  form: "flex flex-col gap-5",
  rules: "flex flex-col gap-2",
  note: "text-caption text-navy/65",
  submit:
    "text-small min-h-12 min-w-44 self-start rounded-full bg-navy px-8 text-center font-bold text-white transition hover:bg-navy/90 active:scale-[0.98] disabled:opacity-40",
};

export function PasswordCard({ user }: { user: AdminUser }) {
  const s = useStrings(strings);
  const rulesId = useId();
  const noteId = useId();
  // Passwords live only in this component's state; cleared on success and unmount.
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverCode, setServerCode] = useState<FieldCode | null>(null);
  const [generic, setGeneric] = useState(false);
  const busyRef = useRef(false);
  const nextRef = useRef<HTMLInputElement>(null);
  const flash = useFlash(SUCCESS_VISIBLE_MS);

  const check = checkPassword(next, user.username);
  const matches = confirm === next;
  const canSave = check.allPass && confirm !== "" && matches && !saving;
  const confirmError = confirm !== "" && !matches ? s.mismatch : null;

  function edited() {
    setServerCode(null);
    setGeneric(false);
    flash.clear();
  }

  async function handleConfirm() {
    if (busyRef.current) return;
    busyRef.current = true;
    setSaving(true);
    try {
      await savePassword(next);
      setNext("");
      setConfirm("");
      flash.show(); // the server signed out every other session
    } catch (err) {
      const problem = classifyError(err);
      if (problem.kind === "field" && problem.field === "newPassword") {
        setServerCode(problem.code);
        window.setTimeout(() => nextRef.current?.focus(), 0);
      } else if (problem.kind === "generic") {
        setGeneric(true);
      }
    } finally {
      setSaving(false);
      setConfirming(false);
      busyRef.current = false;
    }
  }

  const labels = { show: s.showPassword, hide: s.hidePassword };

  return (
    <SettingsCard title={s.passwordTitle} hint={s.passwordHint}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canSave) setConfirming(true);
        }}
        className={styles.form}
      >
        <PasswordField
          label={s.newPasswordLabel}
          value={next}
          onChange={(value) => {
            setNext(value);
            edited();
          }}
          autoComplete="new-password"
          maxLength={LIMITS.password}
          labels={labels}
          error={serverCode ? s.errors[serverCode] : null}
          describedBy={`${rulesId} ${noteId}`}
          readOnly={saving}
          disabled={false}
          enterKeyHint="next"
          inputRef={nextRef}
        />

        <div className={styles.rules}>
          <PasswordRules
            id={rulesId}
            items={[
              {
                id: "length",
                label: s.rules.length.replace("{count}", String(check.bytes)),
                state: check.rules.length,
              },
              { id: "notUsername", label: s.rules.notUsername, state: check.rules.notUsername },
            ]}
            labels={{ group: s.rulesGroup, met: s.ruleMet, notMet: s.ruleNotMet }}
          />
          <p id={noteId} className={styles.note}>
            {s.bytesNote}
          </p>
        </div>

        <PasswordField
          label={s.confirmPasswordLabel}
          value={confirm}
          onChange={(value) => {
            setConfirm(value);
            edited();
          }}
          autoComplete="new-password"
          maxLength={LIMITS.password}
          labels={labels}
          error={confirmError}
          readOnly={saving}
          disabled={false}
          enterKeyHint="go"
        />

        <Message tone={generic ? "error" : "success"}>
          {generic ? s.errors.generic : flash.visible ? s.passwordSaved : null}
        </Message>

        <button type="submit" disabled={!canSave} className={styles.submit}>
          {s.savePassword}
        </button>
      </form>

      <ConfirmDialog
        open={confirming}
        busy={saving}
        title={s.passwordConfirmTitle}
        text={s.passwordConfirmBody}
        labels={{ cancel: s.cancel, confirm: s.passwordConfirmAction, busy: s.saving }}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setConfirming(false)}
      />
    </SettingsCard>
  );
}
