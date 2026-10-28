interface ReorderButtonsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  labels: { up: string; down: string };
}

export function ReorderButtons({ onMoveUp, onMoveDown, canMoveUp, canMoveDown, labels }: ReorderButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" aria-label={labels.up} title={labels.up} disabled={!canMoveUp} onClick={onMoveUp} className="flex size-9 items-center justify-center rounded-full border border-navy/10 text-navy transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-30">↑</button>
      <button type="button" aria-label={labels.down} title={labels.down} disabled={!canMoveDown} onClick={onMoveDown} className="flex size-9 items-center justify-center rounded-full border border-navy/10 text-navy transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-30">↓</button>
    </div>
  );
}
