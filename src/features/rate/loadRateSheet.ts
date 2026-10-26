/**
 * The sheet is its own chunk so the landing page stays small.
 * `preloadRateSheet` downloads it early so it opens instantly.
 */
export function loadRateSheet() {
  return import('./RateSheet').then((module) => ({ default: module.RateSheet }));
}

export function preloadRateSheet() {
  void loadRateSheet();
}
