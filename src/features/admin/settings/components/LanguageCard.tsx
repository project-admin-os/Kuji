import { useRef, useState } from "react";
import { Icon } from "@/shared/icons";
import { setLocale, useLocale, useStrings, type Locale } from "@/shared/i18n";
import { saveLanguage } from "../../adminApi";
import { updateUser } from "../../session";
import { LANGUAGE_OPTIONS, SUCCESS_VISIBLE_MS } from "../config";
import { strings } from "../data/strings";
import { classifyError } from "../lib/errors";
import { useFlash } from "./hooks/useFlash";
import { Message } from "./Message";
import { SettingsCard } from "./SettingsCard";

const styles = {
  group:
    "grid w-full max-w-sm grid-cols-2 gap-1 rounded-full border border-navy/15 bg-mist p-1",
  option: "relative block",
  input: "peer sr-only",
  segment:
    "text-small flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full px-4 font-bold text-navy/65 transition peer-checked:bg-navy peer-checked:text-yellow peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy motion-reduce:transition-none",
  status: "flex flex-wrap items-center gap-x-4 gap-y-2",
  saving: "text-small flex items-center gap-2 text-navy/65",
  spin: "size-4 animate-spin motion-reduce:animate-none",
  retry:
    "text-small min-h-11 rounded-full border border-navy/15 bg-white px-4 font-bold transition hover:bg-mist active:scale-[0.98]",
};

type Status = "idle" | "saving" | "error";

export function LanguageCard() {
  const s = useStrings(strings);
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [failed, setFailed] = useState<Locale | null>(null);
  const busyRef = useRef(false);
  const flash = useFlash(SUCCESS_VISIBLE_MS);

  // Optimistic: switch now, revert if the server says no.
  async function choose(next: Locale) {
    if (busyRef.current || next === locale) return;
    busyRef.current = true;
    const previous = locale;
    setLocale(next);
    setStatus("saving");
    setFailed(null);
    flash.clear();
    try {
      updateUser(await saveLanguage(next));
      setStatus("idle");
      flash.show();
    } catch (error) {
      setLocale(previous);
      if (classifyError(error).kind === "session") {
        setStatus("idle"); // handled centrally
      } else {
        setStatus("error");
        setFailed(next);
      }
    } finally {
      busyRef.current = false;
    }
  }

  const showStatus = status !== "idle" || flash.visible;

  return (
    <SettingsCard title={s.languageTitle} hint={s.languageHint}>
      <div
        role="radiogroup"
        aria-label={s.languageGroup}
        aria-busy={status === "saving"}
        className={styles.group}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <label key={option.id} className={styles.option}>
            <input
              type="radio"
              name="admin-language"
              value={option.id}
              checked={locale === option.id}
              onChange={() => void choose(option.id)}
              className={styles.input}
            />
            <span lang={option.id} className={styles.segment}>
              {option.label}
            </span>
          </label>
        ))}
      </div>

      {showStatus && (
        <div className={styles.status}>
          {status === "saving" && (
            <p role="status" className={styles.saving}>
              <Icon name="refresh" className={styles.spin} />
              {s.saving}
            </p>
          )}
          <Message tone={status === "error" ? "error" : "success"}>
            {status === "error" ? s.languageFailed : flash.visible ? s.languageSaved : null}
          </Message>
          {status === "error" && failed && (
            <button type="button" onClick={() => void choose(failed)} className={styles.retry}>
              {s.retry}
            </button>
          )}
        </div>
      )}
    </SettingsCard>
  );
}
