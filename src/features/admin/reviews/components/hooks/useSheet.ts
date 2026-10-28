import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type PointerEvent,
  type RefObject,
} from 'react';

const DISMISS_DISTANCE = 150;
const DISMISS_FLICK_DISTANCE = 60;
const DISMISS_FLICK_SPEED = 0.6;
const CLOSE_FALLBACK_MS = 400;
const DRAG_EXIT_MS = 200;

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

type Phase = 'open' | 'closing' | 'dragOut';

export interface SheetState {
  panelRef: RefObject<HTMLDivElement | null>;
  closing: boolean;
  dismissed: boolean;
  dragging: boolean;
  offset: number;
  requestClose: () => void;
  onExited: (event: AnimationEvent<HTMLDivElement>) => void;
  handleProps: {
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
  };
}

export function useSheet(onClosed: () => void): SheetState {
  const panelRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('open');
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const phaseRef = useRef<Phase>('open');
  const finishedRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const dragRef = useRef<{ startY: number; startTime: number } | null>(null);
  const onClosedRef = useRef(onClosed);

  useEffect(() => {
    onClosedRef.current = onClosed;
  });

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onClosedRef.current();
  }, []);

  const requestClose = useCallback(() => {
    if (phaseRef.current !== 'open') return;
    phaseRef.current = 'closing';
    setPhase('closing');
    setOffset(0);
    timerRef.current = window.setTimeout(finish, CLOSE_FALLBACK_MS);
  }, [finish]);

  const dismissByDrag = useCallback(() => {
    phaseRef.current = 'dragOut';
    setPhase('dragOut');
    setOffset(panelRef.current?.offsetHeight ?? window.innerHeight);
    timerRef.current = window.setTimeout(finish, DRAG_EXIT_MS);
  }, [finish]);

  const onExited = useCallback(
    (event: AnimationEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      if (phaseRef.current === 'closing') finish();
    },
    [finish],
  );

  // ---- Drag to dismiss ----
  const endDrag = useCallback(
    (event: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
      const drag = dragRef.current;
      if (!drag) return;
      dragRef.current = null;
      setDragging(false);

      const distance = Math.max(0, event.clientY - drag.startY);
      const speed = distance / Math.max(1, performance.now() - drag.startTime);
      const flicked = distance > DISMISS_FLICK_DISTANCE && speed > DISMISS_FLICK_SPEED;

      if (!cancelled && (distance > DISMISS_DISTANCE || flicked)) dismissByDrag();
      else setOffset(0);
    },
    [dismissByDrag],
  );

  const handleProps: SheetState['handleProps'] = {
    onPointerDown: (event) => {
      if (phaseRef.current !== 'open') return;
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = { startY: event.clientY, startTime: performance.now() };
      setDragging(true);
    },
    onPointerMove: (event) => {
      if (!dragRef.current) return;
      setOffset(Math.max(0, event.clientY - dragRef.current.startY));
    },
    onPointerUp: (event) => endDrag(event, false),
    onPointerCancel: (event) => endDrag(event, true),
  };

  // ---- Focus, scroll lock, Escape, Tab trap ----
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        requestClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timerRef.current);
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [requestClose]);

  return {
    panelRef,
    closing: phase === 'closing',
    dismissed: phase !== 'open',
    dragging,
    offset,
    requestClose,
    onExited,
    handleProps,
  };
}
