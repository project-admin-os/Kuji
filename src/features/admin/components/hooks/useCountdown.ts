import { useEffect, useRef, useState } from "react";

const TICK_MS = 1000;

export function useCountdown(seconds: number, onDone: () => void): number {
  const [remaining, setRemaining] = useState(seconds);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const endsAt = performance.now() + seconds * 1000;
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt - performance.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(timer);
        onDoneRef.current();
      }
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [seconds]);

  return remaining;
}
