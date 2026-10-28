import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import avatar from "@/assets/avatar.jpg";
import wordmark from "@/assets/wordmark.png";
import { setLocale, useLocale, useStrings } from "@/shared/i18n";
import { handleInternalClick } from "@/shared/router";
import { Background } from "@/features/landing/components/Background";
import { LanguageToggle } from "@/features/landing/components/LanguageToggle";
import { ButtonCard, ExternalCard, LinkCard } from "./components/ActionCard";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { site } from "./data/site";
import { strings } from "./data/strings";

const loadRatePage = () =>
  import("@/features/rate/RatePage").then((module) => ({
    default: module.RatePage,
  }));
const RatePage = lazy(loadRatePage);
const preloadRatePage = () => void loadRatePage().catch(() => {});

const CURRENT_YEAR = new Date().getFullYear();
const PRELOAD_DELAY_MS = 2000;

const styles = {
  page: "relative isolate min-h-dvh",
  container:
    "relative mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-6 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]",
  toggleSlot: "absolute end-6 top-6 z-10",
  main: "flex flex-1 flex-col gap-6",
  nav: "flex flex-col gap-6",
  group: "flex flex-col gap-3",
  groupTitle: "text-small text-navy/65 px-1 font-bold",
};

export function LandingPage() {
  const s = useStrings(strings);
  const locale = useLocale();
  const [rateOpen, setRateOpen] = useState(false);

  const nextLocale = locale === "en" ? "ar" : "en";
  const handleSwitchLanguage = () => setLocale(nextLocale);
  const handleOpenRate = () => setRateOpen(true);
  const handleCloseRate = useCallback(() => setRateOpen(false), []);

  useEffect(() => {
    const timer = window.setTimeout(preloadRatePage, PRELOAD_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={styles.page}>
      <Background />

      <div className={styles.container}>
        <div className={styles.toggleSlot}>
          <LanguageToggle
            label={s.languageName}
            ariaLabel={s.switchToLanguage}
            lang={nextLocale}
            onClick={handleSwitchLanguage}
          />
        </div>

        <Header
          brandName={site.brand.name}
          avatarSrc={avatar}
          wordmarkSrc={wordmark}
          taglineLead={s.taglineLead}
          taglineEmphasis={s.taglineEmphasis}
        />

        <main className={styles.main}>
          <nav aria-label={site.brand.name} className={styles.nav}>
            {/* 1. Main actions */}
            <div className={styles.group}>
              <LinkCard
                index={0}
                icon="cup"
                title={s.menuTitle}
                hint={s.menuHint}
                href="/menu"
                onClick={handleInternalClick}
                tone="featured"
              />
              <ButtonCard
                index={1}
                icon="star"
                title={s.rateTitle}
                hint={s.rateHint}
                onClick={handleOpenRate}
                onWarm={preloadRatePage}
              />
            </div>

            {/* 2. Social media */}
            <section className={styles.group}>
              <h2 className={styles.groupTitle}>{s.followUs}</h2>
              <ExternalCard
                index={2}
                icon="instagram"
                title={site.social.instagram.name}
                hint={site.social.instagram.handle}
                href={site.social.instagram.url}
                tone="social"
                newTabLabel={s.newTab}
              />
            </section>

            {/* 3. Branches */}
            <section className={styles.group}>
              <h2 className={styles.groupTitle}>{s.findUs}</h2>
              {site.branches.map((branch, position) => (
                <ExternalCard
                  key={branch.id}
                  index={3 + position}
                  icon="pin"
                  title={branch.name[locale]}
                  href={branch.mapsUrl}
                  newTabLabel={s.newTab}
                />
              ))}
            </section>
          </nav>
        </main>

        <Footer
          lead={s.footerLead}
          emphasis={s.footerEmphasis}
          copyright={`© ${CURRENT_YEAR} ${site.brand.name}`}
        />
      </div>

      {rateOpen && (
        <Suspense fallback={null}>
          <RatePage onClose={handleCloseRate} />
        </Suspense>
      )}
    </div>
  );
}
