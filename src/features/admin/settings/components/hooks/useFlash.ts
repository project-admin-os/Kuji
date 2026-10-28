import { useCallback, useEffect, useRef, useState } from "react";

// A flag that switches itself off after a while (success messages).
export function useFlash(ms: number) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const clear = useCallback(() => {
    window.clearTimeout(timer.current);
    setVisible(false);
  }, []);

  const show = useCallback(() => {
    window.clearTimeout(timer.current);
    setVisible(true);
    timer.current = window.setTimeout(() => setVisible(false), ms);
  }, [ms]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { visible, show, clear };
}
