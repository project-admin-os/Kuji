// Pure swipe math. "Distance" is always measured toward revealing the action,
// so LTR (swipe left) and RTL (swipe right) share the same logic.

export const AXIS_LOCK_PX = 8;
export const REVEAL_WIDTH = 96; // matches the w-24 action
export const COMMIT_RATIO = 0.4; // of the card width
export const FLING_SPEED = 0.6; // px per ms
const RESISTANCE = 0.35;

export type Axis = "x" | "y";
export type SwipeOutcome = "commit" | "open" | "close";

// null until the pointer has moved far enough to tell the intent.
export function lockAxis(dx: number, dy: number): Axis | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK_PX) return null;
  return Math.abs(dx) > Math.abs(dy) ? "x" : "y";
}

// Screen dx to distance toward the trailing side (the action side).
export function toReveal(dx: number, rtl: boolean): number {
  return rtl ? dx : -dx;
}

// Card offset while dragging: no pull past closed, resistance past the commit threshold.
export function dragPosition(startOffset: number, distance: number, width: number): number {
  const raw = Math.max(0, startOffset + distance);
  const limit = width * COMMIT_RATIO;
  return raw <= limit ? raw : limit + (raw - limit) * RESISTANCE;
}

// velocity: px/ms toward revealing (negative = moving back).
export function decideSwipe(position: number, velocity: number, width: number): SwipeOutcome {
  if (position >= width * COMMIT_RATIO) return "commit";
  if (velocity >= FLING_SPEED && position >= REVEAL_WIDTH) return "commit";
  if (velocity <= -FLING_SPEED) return "close";
  return position >= REVEAL_WIDTH / 2 ? "open" : "close";
}

export function snapOffset(outcome: SwipeOutcome, width: number): number {
  return outcome === "commit" ? width : outcome === "open" ? REVEAL_WIDTH : 0;
}
