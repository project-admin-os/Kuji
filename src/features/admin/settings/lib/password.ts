import { PASSWORD_RULES } from "../config";

export type RuleId = "length" | "notUsername";
export type RuleState = "idle" | "pass" | "fail";

export interface PasswordCheck {
  bytes: number;
  rules: Record<RuleId, RuleState>;
  allPass: boolean;
}

const encoder = new TextEncoder();

// The server limit is in bytes, not characters.
export function byteLength(value: string): number {
  return encoder.encode(value).length;
}

export function checkPassword(next: string, username: string): PasswordCheck {
  const bytes = byteLength(next);
  const state = (ok: boolean): RuleState =>
    next === "" ? "idle" : ok ? "pass" : "fail";

  const rules: Record<RuleId, RuleState> = {
    length: state(bytes >= PASSWORD_RULES.minBytes && bytes <= PASSWORD_RULES.maxBytes),
    notUsername: state(next !== username),
  };

  return {
    bytes,
    rules,
    allPass: Object.values(rules).every((rule) => rule === "pass"),
  };
}
