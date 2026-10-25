/**
 * Icon system (no library). Every icon is a stroke path on a 24x24 grid.
 *
 * USE:
 *   import { Icon } from '@/shared/icons';
 *   <Icon name="arrow" className="size-5 text-navy" />
 *   <Icon name="star" className="size-5 fill-yellow text-yellow" />  
 *
 * ADD AN ICON: add one line to PATHS below. The name appears in autocomplete.
 *
 * RULES:
 *   - Color comes from the text color (text-navy, text-white, ...).
 *   - Size comes from size-* classes. Without one, the icon is 24px.
 *   - Do not put onClick on <Icon />. Wrap it in a <button> or <a>.
 *   - An icon-only button needs aria-label, because icons are hidden from screen readers.
 */

// ==== Icon data ====

const PATHS = {
  cup: "M5 9h11v4.5a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 13.5V9zM16 11h1.5a2.25 2.25 0 0 1 0 4.5H16M8.5 3.5c-.8 1 .8 1.7 0 3M11.5 3.5c-.8 1 .8 1.7 0 3",
  pin: "M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0c0 5.4 6.5 11 6.5 11zM12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z",
  star: "M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.6 1-5.8-4.2-4.1 5.8-.8z",
  chat: "M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4.5 3.5V6.5a1 1 0 0 1 1-1z",
  close: "M6 6l12 12M18 6L6 18",
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  instagram:
    "M8 3.5h8A4.5 4.5 0 0 1 20.5 8v8a4.5 4.5 0 0 1-4.5 4.5H8A4.5 4.5 0 0 1 3.5 16V8A4.5 4.5 0 0 1 8 3.5zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM17 7h.01",
  chevron: "M6 9l6 6 6-6",
  logout:
    "M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10M15 8l4 4-4 4M19 12H9",
  trash:
    "M5 7h14M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6A1.2 1.2 0 0 1 14.5 5.2V7M18 7l-.8 12.1A2 2 0 0 1 15.2 21H8.8a2 2 0 0 1-2-1.9L6 7M10 11v6M14 11v6",
} as const;

// ==== Types ====

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  className?: string;
}

// ==== Settings ====

const FLIP_IN_RTL: readonly IconName[] = ["arrow", "logout"];

const SVG_ATTRIBUTES = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

// ==== Component ====

export function Icon({ name, className = "" }: IconProps) {
  const flip = FLIP_IN_RTL.includes(name) ? "rtl:-scale-x-100" : "";
  return (
    <svg {...SVG_ATTRIBUTES} className={`${flip} ${className}`.trim()}>
      <path d={PATHS[name]} />
    </svg>
  );
}
