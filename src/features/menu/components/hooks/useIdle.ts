import { useEffect, useState } from "react";

export function useIdle(delayMs = 180): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);
  return ready;
}
