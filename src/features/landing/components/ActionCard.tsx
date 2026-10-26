import type { CSSProperties, MouseEventHandler } from 'react';
import { Icon, type IconName } from '@/shared/icons';

// ==== Shared look ====

type CardTone = 'standard' | 'featured' | 'social';

interface CardFaceProps {
  icon: IconName;
  title: string;
  hint?: string;
  tone?: CardTone;
  index?: number;
}

const styles = {
  card: 'group stagger animate-reveal-in flex min-h-16 w-full items-center gap-4 rounded-lg px-4 py-3 text-start transition active:scale-[0.98]',
  iconBubble: 'flex size-11 shrink-0 items-center justify-center rounded-full',
  icon: 'size-6',
  textColumn: 'min-w-0 flex-1',
  title: 'text-heading block font-bold text-balance',
  hint: 'text-small block',
  arrow:
    'size-5 shrink-0 opacity-70 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1',
  srOnly: 'sr-only',
};

const tones: Record<CardTone, { card: string; bubble: string; hint: string }> = {
  standard: {
    card: 'border border-white/70 bg-white/80 text-navy hover:bg-white',
    bubble: 'bg-arctic text-navy',
    hint: 'text-navy/65',
  },
  featured: {
    card: 'bg-navy text-white hover:bg-navy/90',
    bubble: 'bg-yellow text-navy',
    hint: 'text-white/75',
  },
  social: {
    card: 'border border-white/70 bg-white/80 text-navy hover:bg-white',
    bubble: 'bg-navy text-yellow',
    hint: 'text-navy/65',
  },
};

function cardClass(tone: CardTone = 'standard') {
  return `${styles.card} ${tones[tone].card}`;
}

function cardStyle(index?: number): CSSProperties | undefined {
  return index === undefined ? undefined : ({ '--i': index } as CSSProperties);
}

function CardFace({ icon, title, hint, tone = 'standard' }: Omit<CardFaceProps, 'index'>) {
  return (
    <>
      <span className={`${styles.iconBubble} ${tones[tone].bubble}`}>
        <Icon name={icon} className={styles.icon} />
      </span>
      <span className={styles.textColumn}>
        <span className={styles.title}>{title}</span>
        {hint && <span className={`${styles.hint} ${tones[tone].hint}`}>{hint}</span>}
      </span>
      <Icon name="arrow" className={styles.arrow} />
    </>
  );
}

// ==== Variants ====

export function LinkCard({
  href,
  onClick,
  index,
  ...face
}: CardFaceProps & { href: string; onClick: MouseEventHandler<HTMLAnchorElement> }) {
  return (
    <a href={href} onClick={onClick} style={cardStyle(index)} className={cardClass(face.tone)}>
      <CardFace {...face} />
    </a>
  );
}

export function ExternalCard({
  href,
  newTabLabel,
  index,
  ...face
}: CardFaceProps & { href: string; newTabLabel: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={cardStyle(index)}
      className={cardClass(face.tone)}
    >
      <CardFace {...face} />
      <span className={styles.srOnly}>{newTabLabel}</span>
    </a>
  );
}

export function ButtonCard({
  onClick,
  onWarm,
  index,
  ...face
}: CardFaceProps & { onClick: () => void; onWarm?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={onWarm}
      onPointerDown={onWarm}
      onFocus={onWarm}
      style={cardStyle(index)}
      className={cardClass(face.tone)}
    >
      <CardFace {...face} />
    </button>
  );
}
