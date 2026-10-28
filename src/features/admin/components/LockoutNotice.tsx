import { useState } from "react";
import { useCountdown } from "./hooks/useCountdown";

const styles = {
  box: "text-small rounded-lg border border-error/30 bg-error/10 px-4 py-3 font-bold text-error",
  srOnly: "sr-only",
};

interface LockoutNoticeProps {
  seconds: number;
  message: string;
  onDone: () => void;
}

function formatTime(total: number): string {
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function LockoutNotice({ seconds, message, onDone }: LockoutNoticeProps) {
  const remaining = useCountdown(seconds, onDone);
  // Screen readers hear the wait once; the ticking text is visual only.
  const [announcement] = useState(() => message.replace("{time}", formatTime(seconds)));

  return (
    <div className={styles.box}>
      <p role="alert" className={styles.srOnly}>
        {announcement}
      </p>
      <p aria-hidden="true">{message.replace("{time}", formatTime(remaining))}</p>
    </div>
  );
}
