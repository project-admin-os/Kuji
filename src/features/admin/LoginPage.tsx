import { useEffect, useRef, useState } from "react";
import avatar from "@/assets/avatar.jpg";
import wordmark from "@/assets/wordmark.png";
import { ApiError } from "@/shared/api";
import { useStrings } from "@/shared/i18n";
import { LockoutNotice } from "./components/LockoutNotice";
import { LoginForm } from "./components/LoginForm";
import { DEFAULT_RETRY_SECONDS, LIMITS } from "./config";
import { strings } from "./data/strings";
import { signIn, type SignedOutReason } from "./session";

const EMPTY_FORM = { username: "", password: "" };

const WORDMARK_WIDTH = 190;
const WORDMARK_HEIGHT = 112;
const AVATAR_SIZE = 240;

type Problem = "credentials" | "invalid" | "blocked" | "network" | "server";

const styles = {
  container:
    "relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-6 pt-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]",
  brand: "flex flex-col items-center gap-4 text-center",
  avatar:
    "size-[clamp(5rem,24vw,6.5rem)] rounded-full object-cover ring-4 ring-white/70",
  heading: "text-center",
  wordmark: "h-[clamp(2.75rem,13vw,3.5rem)] w-auto",
  badge: "text-caption rounded-full bg-navy px-3 py-1 font-bold text-yellow",
  card: "animate-reveal-in flex flex-col gap-6 rounded-lg border border-white/70 bg-white/80 p-6",
  title: "text-title font-bold text-balance",
  hint: "text-small mt-1 text-navy/65",
  messages: "flex flex-col gap-3 empty:hidden",
  notice:
    "text-small rounded-lg border border-navy/15 bg-arctic/50 px-4 py-3 font-bold",
  error:
    "text-small rounded-lg border border-error/30 bg-error/10 px-4 py-3 font-bold text-error",
};

function problemFor(error: unknown): Problem {
  if (!(error instanceof ApiError)) return "network";
  if (error.status === 401) return "credentials";
  if (error.status === 403) return "blocked";
  if (error.status === 422) return "invalid";
  return "server";
}

export function LoginPage({
  notice,
}: {
  notice: Exclude<SignedOutReason, "none"> | null;
}) {
  const s = useStrings(strings);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [lockSeconds, setLockSeconds] = useState<number | null>(null);
  const busyRef = useRef(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const locked = lockSeconds !== null;
  const filled = form.username.trim() !== "" && form.password !== "";
  const canSubmit = filled && !submitting && !locked;

  const problemText: Record<Problem, string> = {
    credentials: s.errorCredentials,
    invalid: s.errorInvalid,
    blocked: s.errorBlocked,
    network: s.errorNetwork,
    server: s.errorServer,
  };

  useEffect(() => {
    if (problem === "credentials") passwordRef.current?.focus();
  }, [problem]);

  function handleChange(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit() {
    if (!canSubmit || busyRef.current) return;
    busyRef.current = true;
    setSubmitting(true);
    setProblem(null);
    try {
      await signIn(form.username.trim(), form.password);
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setLockSeconds(error.retryAfter ?? DEFAULT_RETRY_SECONDS);
      } else {
        setProblem(problemFor(error));
      }
    } finally {
      setForm((current) => ({ ...current, password: "" }));
      setSubmitting(false);
      busyRef.current = false;
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.brand}>
        <img
          src={avatar}
          alt=""
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          fetchPriority="high"
          decoding="async"
          className={styles.avatar}
        />
        <img
          src={wordmark}
          alt={s.brandName}
          width={WORDMARK_WIDTH}
          height={WORDMARK_HEIGHT}
          decoding="async"
          className={styles.wordmark}
        />
        <span className={styles.badge}>{s.adminBadge}</span>
      </header>

      <main className={styles.card}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{s.loginTitle}</h1>
          <p className={styles.hint}>{s.loginHint}</p>
        </div>

        <div className={styles.messages}>
          {notice === "expired" && (
            <p role="status" className={styles.notice}>
              {s.sessionExpired}
            </p>
          )}
          {notice === "logoutFailed" && (
            <p role="status" className={styles.notice}>
              {s.logoutIncomplete}
            </p>
          )}
          {problem && (
            <p role="alert" className={styles.error}>
              {problemText[problem]}
            </p>
          )}
          {lockSeconds !== null && (
            <LockoutNotice
              seconds={lockSeconds}
              message={s.rateLimited}
              onDone={() => setLockSeconds(null)}
            />
          )}
        </div>

        <LoginForm
          values={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          limits={LIMITS}
          labels={{
            username: s.usernameLabel,
            password: s.passwordLabel,
            showPassword: s.showPassword,
            hidePassword: s.hidePassword,
            submit: submitting ? s.signingIn : s.signIn,
          }}
          passwordRef={passwordRef}
          busy={submitting}
          canSubmit={canSubmit}
        />
      </main>
    </div>
  );
}
