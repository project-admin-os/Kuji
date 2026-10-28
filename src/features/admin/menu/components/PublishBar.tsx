import type { MenuAdminStrings } from "../data/strings";
import type { MenuIssue } from "@/features/menu/types";

interface PublishBarProps {
  dirty: boolean;
  saving: boolean;
  issues: MenuIssue[];
  copy: MenuAdminStrings;
  onImport: () => void;
  onDiscard: () => void;
  onPublish: () => void;
}

export function PublishBar({ dirty, saving, issues, copy, onImport, onDiscard, onPublish }: PublishBarProps) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-5 border-t border-navy/10 bg-mist/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {issues.length > 0 && <p className="mb-2 text-caption font-semibold text-error" role="status">{copy.validationSummary} ({issues.length})</p>}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onImport} disabled={saving} className="min-h-10 rounded-full border border-navy/15 bg-white px-4 text-caption font-semibold text-navy hover:bg-mist disabled:opacity-50">{copy.importStarter}</button>
          <button type="button" onClick={onDiscard} disabled={!dirty || saving} className="min-h-10 rounded-full px-4 text-caption font-semibold text-navy/60 hover:bg-white disabled:opacity-35">{copy.discard}</button>
        </div>
        <button type="button" onClick={onPublish} disabled={!dirty || saving || issues.length > 0} className="min-h-11 rounded-full bg-navy px-6 text-small font-bold text-white shadow-sm transition hover:bg-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40">
          {saving ? copy.publishing : copy.publish}
        </button>
      </div>
    </div>
  );
}
