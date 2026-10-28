import { useState } from "react";
import { apiPost } from "@/shared/api";
import { useStrings } from "@/shared/i18n";
import { ChoiceCard } from "./components/ChoiceCard";
import { FeedbackForm } from "./components/FeedbackForm";
import { useSheet } from "./components/hooks/useSheet";
import { Sheet } from "./components/Sheet";
import { ThankYou } from "./components/ThankYou";
import { FEEDBACK_PATH, GOOGLE_REVIEW_URL, LIMITS } from "./config";
import { strings } from "./data/strings";

const EMPTY_FORM = { message: "", name: "", contact: "", website: "" };

type Step = "choose" | "note" | "sent";
type Status = "idle" | "sending" | "error";

const styles = {
  step: "animate-reveal-in",
  choices: "flex flex-col gap-3 pb-2",
};

export function RatePage({ onClose }: { onClose: () => void }) {
  const s = useStrings(strings);
  const sheet = useSheet(onClose);
  const [step, setStep] = useState<Step>("choose");
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState(EMPTY_FORM);

  const message = form.message.trim();
  const tooShort = message.length < LIMITS.minNote;
  const canSubmit = !tooShort && status !== "sending";

  const title = step === "note" ? s.noteTitle : s.sheetTitle;

  function handleReview() {
    window.open(GOOGLE_REVIEW_URL, "_blank", "noopener,noreferrer");
    sheet.requestClose();
  }

  function handleChange(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setStatus("sending");
    try {
      await apiPost(FEEDBACK_PATH, {
        message,
        name: form.name.trim(),
        contact: form.contact.trim(),
        website: form.website,
      });
      setStatus("idle");
      setStep("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Sheet title={title} closeLabel={s.close} sheet={sheet}>
      <div key={step} className={styles.step}>
        {step === "choose" && (
          <div className={styles.choices}>
            <ChoiceCard
              icon="star"
              title={s.reviewTitle}
              hint={s.reviewHint}
              onClick={handleReview}
            />
            <ChoiceCard
              icon="chat"
              title={s.noteTitle}
              hint={s.noteHint}
              onClick={() => setStep("note")}
            />
          </div>
        )}

        {step === "note" && (
          <FeedbackForm
            values={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
            limits={LIMITS}
            labels={{
              note: s.noteLabel,
              name: s.nameLabel,
              contact: s.contactLabel,
              submit: status === "sending" ? s.sending : s.send,
              error: s.error,
            }}
            noteHint={tooShort ? s.tooShort : undefined}
            canSubmit={canSubmit}
            hasError={status === "error"}
          />
        )}

        {step === "sent" && (
          <ThankYou
            message={s.thanks}
            closeLabel={s.close}
            onClose={sheet.requestClose}
          />
        )}
      </div>
    </Sheet>
  );
}
