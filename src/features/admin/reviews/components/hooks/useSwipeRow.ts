import { useCallback, useEffect, useRef, type MouseEvent, type PointerEvent } from "react";
import { dragPosition, decideSwipe, lockAxis, REVEAL_WIDTH, snapOffset, toReveal, type Axis } from "../../lib/swipe";

const SNAP_MS = 220;
const COMMIT_DELAY_MS = 180;
const VELOCITY_WINDOW_MS = 100;
const INTERACTIVE = "a,input,select,textarea,[data-no-swipe]";

interface Options {
  enabled: boolean; // off while in selection mode
  open: boolean; // controlled by the list so only one card is open
  rtl: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: () => void;
}

interface Drag {
  startX: number;
  startY: number;
  startOffset: number;
  width: number;
  axis: Axis | null;
  samples: { d: number; t: number }[];
  position: number;
}

// The transform is written straight to the element during the drag; React state
// only changes when the gesture ends.
export function useSwipeRow<T extends HTMLElement>(options: Options) {
  const ref = useRef<T>(null);
  const dragRef = useRef<Drag | null>(null);
  const offsetRef = useRef(0);
  const suppressClickRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  const apply = useCallback((offset: number, animate: boolean) => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sign = optionsRef.current.rtl ? 1 : -1;
    offsetRef.current = offset;
    el.style.transition = animate && !reduced ? `transform ${SNAP_MS}ms var(--ease-smooth)` : "none";
    el.style.transform = offset === 0 ? "" : `translateX(${sign * offset}px)`;
  }, []);

  // Follow the controlled open state (another card opened, scroll, list change).
  useEffect(() => {
    if (dragRef.current) return;
    const target = options.open ? REVEAL_WIDTH : 0;
    if (offsetRef.current !== target) apply(target, true);
  }, [options.open, apply]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function onPointerDown(event: PointerEvent<T>) {
    const el = ref.current;
    if (!el || !options.enabled || event.button !== 0) return;
    if ((event.target as HTMLElement).closest(INTERACTIVE)) return;
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offsetRef.current,
      width: el.offsetWidth,
      axis: null,
      samples: [],
      position: offsetRef.current,
    };
  }

  function onPointerMove(event: PointerEvent<T>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    if (drag.axis === null) {
      const axis = lockAxis(dx, event.clientY - drag.startY);
      if (axis === null) return;
      if (axis === "y") {
        dragRef.current = null; // vertical scroll stays native
        return;
      }
      drag.axis = "x";
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const distance = toReveal(dx, optionsRef.current.rtl);
    drag.position = dragPosition(drag.startOffset, distance, drag.width);
    const now = performance.now();
    drag.samples = [...drag.samples.filter((s) => now - s.t <= VELOCITY_WINDOW_MS), { d: distance, t: now }];
    apply(drag.position, false);
  }

  function velocityOf(drag: Drag): number {
    const first = drag.samples[0];
    const last = drag.samples[drag.samples.length - 1];
    if (!first || !last || last.t === first.t) return 0;
    return (last.d - first.d) / (last.t - first.t);
  }

  function onPointerUp() {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || drag.axis !== "x") return;
    suppressClickRef.current = true; // the click that follows a drag is not a tap
    window.setTimeout(() => (suppressClickRef.current = false), 50);

    const outcome = decideSwipe(drag.position, velocityOf(drag), drag.width);
    apply(snapOffset(outcome, drag.width), true);
    if (outcome === "commit") {
      optionsRef.current.onOpenChange(false);
      timerRef.current = window.setTimeout(() => optionsRef.current.onCommit(), COMMIT_DELAY_MS);
    } else {
      optionsRef.current.onOpenChange(outcome === "open");
    }
  }

  function onPointerCancel() {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.axis === "x") apply(optionsRef.current.open ? REVEAL_WIDTH : 0, true);
  }

  // Suppresses the click after a drag; a tap on an open card just closes it.
  function onClickCapture(event: MouseEvent<T>) {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
    } else if (optionsRef.current.open) {
      event.preventDefault();
      event.stopPropagation();
      optionsRef.current.onOpenChange(false);
    }
  }

  return { ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture };
}
