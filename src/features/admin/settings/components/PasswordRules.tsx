import { Icon } from "@/shared/icons";
import type { RuleState } from "../lib/password";

const styles = {
  list: "flex flex-col gap-1",
  item: "text-caption flex items-center gap-2",
  pass: "text-success",
  other: "text-navy/65",
  mark: "flex size-4 shrink-0 items-center justify-center",
  check: "size-4",
  ring: "size-3 rounded-full border border-current",
  srOnly: "sr-only",
};

export interface RuleItem {
  id: string;
  label: string;
  state: RuleState;
}

interface PasswordRulesProps {
  id: string;
  items: RuleItem[];
  labels: { group: string; met: string; notMet: string };
}

export function PasswordRules({ id, items, labels }: PasswordRulesProps) {
  return (
    <ul id={id} aria-label={labels.group} className={styles.list}>
      {items.map((item) => {
        const pass = item.state === "pass";
        return (
          <li
            key={item.id}
            className={`${styles.item} ${pass ? styles.pass : styles.other}`}
          >
            <span aria-hidden="true" className={styles.mark}>
              {pass ? (
                <Icon name="check" className={styles.check} />
              ) : (
                <span className={styles.ring} />
              )}
            </span>
            <span>{item.label}</span>
            <span className={styles.srOnly}>{pass ? labels.met : labels.notMet}</span>
          </li>
        );
      })}
    </ul>
  );
}
