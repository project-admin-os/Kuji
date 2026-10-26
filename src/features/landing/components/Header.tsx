interface HeaderProps {
  brandName: string;
  avatarSrc: string;
  wordmarkSrc: string;
  taglineLead: string;
  taglineEmphasis: string;
}

const AVATAR_SIZE = 240;
const WORDMARK_WIDTH = 190;
const WORDMARK_HEIGHT = 112;

const styles = {
  header: 'flex flex-col items-center text-center',
  avatar: 'size-[clamp(5rem,24vw,6.5rem)] rounded-full object-cover ring-4 ring-white/70',
  heading: 'mt-6',
  wordmark: 'h-[clamp(2.75rem,13vw,3.5rem)] w-auto',
  tagline: 'text-title mt-4 font-light text-balance',
  taglineEmphasis: 'font-black',
};

export function Header({
  brandName,
  avatarSrc,
  wordmarkSrc,
  taglineLead,
  taglineEmphasis,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <img
        src={avatarSrc}
        alt=""
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
        fetchPriority="high"
        decoding="async"
        className={styles.avatar}
      />
      <h1 className={styles.heading}>
        <img
          src={wordmarkSrc}
          alt={brandName}
          width={WORDMARK_WIDTH}
          height={WORDMARK_HEIGHT}
          decoding="async"
          className={styles.wordmark}
        />
      </h1>
      <p className={styles.tagline}>
        {taglineLead} <span className={styles.taglineEmphasis}>{taglineEmphasis}</span>
      </p>
    </header>
  );
}
