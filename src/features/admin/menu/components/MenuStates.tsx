import type { MenuAdminStrings } from "../data/strings";

interface MenuStatesProps {
  status: "loading" | "ready" | "error";
  message: string | null;
  copy: MenuAdminStrings;
  onRetry: () => void;
}

export function MenuStates({ status, message, copy, onRetry }: MenuStatesProps) {
  if (status === "ready") return null;
  if (status === "loading") return <div className="grid min-h-64 place-items-center text-small text-navy/60" role="status">{copy.loading}</div>;
  return (
    <div className="mx-auto grid max-w-lg gap-4 rounded-2xl border border-error/15 bg-white p-6 text-center shadow-card" role="alert">
      <p className="text-small text-navy/70">{copy.loadError}{message ? ` ${message}` : ""}</p>
      <button type="button" onClick={onRetry} className="min-h-11 rounded-full bg-navy px-5 text-small font-bold text-white hover:bg-navy/90">{copy.retry}</button>
    </div>
  );
}
