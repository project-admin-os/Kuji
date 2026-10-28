import { useStrings } from "@/shared/i18n";
import { useSession } from "../session";
import { LanguageCard } from "./components/LanguageCard";
import { PasswordCard } from "./components/PasswordCard";
import { UsernameCard } from "./components/UsernameCard";
import { strings } from "./data/strings";

const styles = {
  scroller: "min-h-0 flex-1 overflow-y-auto",
  page: "mx-auto flex w-full max-w-[40rem] flex-col gap-5 px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:px-8 lg:pt-8",
  header: "flex flex-col gap-1",
  title: "text-title font-bold text-balance",
  description: "text-small text-navy/65",
};

export function SettingsTab() {
  const s = useStrings(strings);
  const session = useSession();

  if (session.status !== "signedIn") return null;
  const { user } = session;

  return (
    <div className={styles.scroller}>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>{s.title}</h1>
          <p className={styles.description}>{s.description}</p>
        </header>

        <LanguageCard />
        <UsernameCard user={user} />
        <PasswordCard user={user} />
      </div>
    </div>
  );
}
