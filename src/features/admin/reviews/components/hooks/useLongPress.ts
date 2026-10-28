import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";

const HOLD_MS = 450;
const TOLERANCE_PX = 8;

export function useLongPress<T extends HTMLElement>(enabled: boolean, onLongPress: () => void) {
  const timerRef = useRef<number | undefined>(undefined);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);
  const callbackRef = useRef(onLongPress);

  useEffect(() => {
    callbackRef.current = onLongPress;
  });
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function cancel() {
    window.clearTimeout(timerRef.current);
    startRef.current = null;
  }

  function onPointerDown(event: PointerEvent<T>) {
    if (!enabled || event.button !== 0) return;
    firedRef.current = false;
    startRef.current = { x: event.clientX, y: event.clientY };
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      firedRef.current = true;
      startRef.current = null;
      try {
        navigator.vibrate?.(10);
      } catch {
        // Vibration is optional.
      }
      callbackRef.current();
    }, HOLD_MS);
  }

  function onPointerMove(event: PointerEvent<T>) {
    const start = startRef.current;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > TOLERANCE_PX) cancel();
  }

  // True once after a long-press: the tap that follows it must be ignored.
  function consumeFired(): boolean {
    const fired = firedRef.current;
    firedRef.current = false;
    return fired;
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onContextMenu: (event: MouseEvent<T>) => event.preventDefault(),
    consumeFired,
  };
}
