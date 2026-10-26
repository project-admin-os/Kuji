interface FooterProps {
  lead: string;
  emphasis: string;
  copyright: string;
}

const styles = {
  footer: 'animate-reveal-in flex flex-col items-center gap-2 text-center',
  lead: 'text-small font-medium',
  emphasis: 'font-black',
  copyright: 'text-caption text-navy/65 whitespace-nowrap',
};

export function Footer({ lead, emphasis, copyright }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <p className={styles.lead}>
        {lead} <span className={styles.emphasis}>{emphasis}</span>
      </p>
      <p dir="ltr" className={styles.copyright}>
        {copyright}
      </p>
    </footer>
  );
}
