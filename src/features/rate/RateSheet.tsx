import { useEffect, useRef, useState } from 'react';
import { useStrings } from '@/shared/i18n';
import { Icon } from '@/shared/icons';
import { strings } from './strings';

/**
 * MOCK. Placeholder bottom sheet until the real review form is built.
 * It already handles open/close animation, Escape, scrim click, scroll lock
 * and focus, so the real form only has to replace the content.
 */

// Matches --animate-slide-down (220ms) in index.css.
const EXIT_MS = 220;

const styles = {
  overlay: 'fixed inset-0 z-50 flex items-end justify-center',
  scrim: 'absolute inset-0 bg-scrim',
  sheet:
    'relative w-full max-w-md rounded-t-sheet bg-white px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl',
  handle: 'mx-auto mb-4 h-1.5 w-10 rounded-full bg-navy/15',
  headerRow: 'flex items-center justify-between gap-4',
  title: 'text-title font-bold',
  closeButton:
    'flex size-12 shrink-0 items-center justify-center rounded-full bg-mist transition active:scale-95 hover:bg-arctic',
  closeIcon: 'size-5',
  message: 'text-body mt-2 text-navy/65',
};

interface RateSheetProps {
  onClose: () => void;
}

export function RateSheet({ onClose }: RateSheetProps) {
  const s = useStrings(strings);
  const [closing, setClosing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const requestClose = () => setClosing(true);

  // Tell the parent only after the exit animation has played.
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onClose, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [closing, onClose]);

  // Escape key closes the sheet.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setClosing(true);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock page scroll while open, and give focus back when closed.
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return (
    <div className={styles.overlay}>
      <div
        aria-hidden="true"
        onClick={requestClose}
        className={`${styles.scrim} ${closing ? 'animate-scrim-out' : 'animate-scrim-in'}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rate-sheet-title"
        className={`${styles.sheet} ${closing ? 'animate-slide-down' : 'animate-slide-up'}`}
      >
        <div aria-hidden="true" className={styles.handle} />
        <div className={styles.headerRow}>
          <h2 id="rate-sheet-title" className={styles.title}>
            {s.title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={requestClose}
            aria-label={s.close}
            className={styles.closeButton}
          >
            <Icon name="close" className={styles.closeIcon} />
          </button>
        </div>
        <p className={styles.message}>{s.comingSoon}</p>
      </div>
    </div>
  );
}
