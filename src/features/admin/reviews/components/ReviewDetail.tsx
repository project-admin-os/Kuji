import { useState } from "react";
import { useLocale } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { formatAbsolute, formatRelative, parseServerDate } from "../lib/dates";
import { classifyContact, contactHref } from "../lib/contact";
import { strings } from "../data/strings";
import type { ReviewItem } from "../types";

const styles = {
  wrapper: "flex flex-col gap-5",
  nav: "flex items-center justify-between",
  navButton:
    "flex min-h-11 min-w-11 items-center justify-center rounded-full text-navy transition hover:bg-arctic/50 active:scale-[0.98] disabled:opacity-30 disabled:hover:bg-transparent",
  prevIcon: "size-5 rotate-180 rtl:rotate-0",
  nextIcon: "size-5 rtl:rotate-180",
  meta: "flex flex-col gap-1",
  name: "text-heading font-bold text-balance",
  time: "text-small text-navy/65",
  message: "text-body whitespace-pre-wrap break-words text-navy/90",
  contactRow: "flex flex-wrap items-center gap-2 border-t border-navy/10 pt-4",
  contactValue: "text-small font-bold text-navy break-all",
  contactLink: "text-small font-bold text-navy underline underline-offset-2",
  deleteRow: "border-t border-navy/10 pt-4",
  deleteButton:
    "flex min-h-11 items-center gap-1.5 rounded-full border border-error/30 px-4 text-small font-bold text-error transition hover:bg-error/10 active:scale-[0.98]",
  actionButton:
    "flex min-h-9 items-center gap-1.5 rounded-full border border-navy/15 px-3 text-small font-bold text-navy transition hover:bg-mist active:scale-[0.98]",
};

interface ReviewDetailProps {
  review: ReviewItem;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  onDelete: () => void;
}

export function ReviewDetail({ review, onPrev, onNext, canPrev, canNext, onDelete }: ReviewDetailProps) {
  const locale = useLocale();
  const s = strings[locale];
  const [copied, setCopied] = useState(false);
  const created = parseServerDate(review.created_at);

  const contactKind = review.contact ? classifyContact(review.contact) : "text";
  const href = review.contact ? contactHref(review.contact, contactKind) : null;

  async function copyContact() {
    try {
      await navigator.clipboard.writeText(review.contact);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the value is still visible and selectable.
    }
  }

  return (
    <div className={styles.wrapper}>
      <nav className={styles.nav}>
        <button type="button" onClick={onPrev} disabled={!canPrev} aria-label={s.prevReview} className={styles.navButton}>
          <Icon name="arrow" className={styles.prevIcon} />
        </button>
        <button type="button" onClick={onNext} disabled={!canNext} aria-label={s.nextReview} className={styles.navButton}>
          <Icon name="arrow" className={styles.nextIcon} />
        </button>
      </nav>

      <div className={styles.meta}>
        <h3 className={styles.name}>{review.name || s.anonymous}</h3>
        <time className={styles.time} dateTime={review.created_at} title={formatAbsolute(created, locale)}>
          {formatRelative(created, locale)} · {formatAbsolute(created, locale)}
        </time>
      </div>

      <p className={styles.message}>{review.message}</p>

      {review.contact && (
        <div className={styles.contactRow}>
          {href ? (
            <a
              href={href}
              className={styles.contactLink}
              aria-label={`${contactKind === "email" ? s.emailContact : s.callContact}: ${review.contact}`}
            >
              {review.contact}
            </a>
          ) : (
            <span className={styles.contactValue}>{review.contact}</span>
          )}
          <button type="button" onClick={copyContact} className={styles.actionButton}>
            <Icon name={copied ? "check" : "copy"} className="size-4" />
            {copied ? s.copiedContact : s.copyContact}
          </button>
        </div>
      )}

      <div className={styles.deleteRow}>
        <button type="button" onClick={onDelete} className={styles.deleteButton}>
          <Icon name="trash" className="size-4" />
          {s.deleteReview}
        </button>
      </div>
    </div>
  );
}
