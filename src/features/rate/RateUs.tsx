import { lazy, Suspense } from 'react';
import { loadRateSheet } from './loadRateSheet';

const RateSheet = lazy(loadRateSheet);

interface RateUsProps {
  open: boolean;
  onClose: () => void;
}

/** Mounts the sheet only while it is open. */
export function RateUs({ open, onClose }: RateUsProps) {
  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <RateSheet onClose={onClose} />
    </Suspense>
  );
}
