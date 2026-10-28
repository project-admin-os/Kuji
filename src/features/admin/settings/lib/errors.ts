import { ApiError } from "@/shared/api";

export type FieldCode =
  | "invalid_username"
  | "unchanged"
  | "username_taken"
  | "weak_password"
  | "same_password";

export type FieldTarget = "username" | "newPassword";

export type SaveProblem =
  | { kind: "field"; field: FieldTarget; code: FieldCode }
  | { kind: "session" } // handled centrally: show nothing
  | { kind: "generic" };

const FIELD_FOR: Record<FieldCode, FieldTarget> = {
  invalid_username: "username",
  unchanged: "username",
  username_taken: "username",
  weak_password: "newPassword",
  same_password: "newPassword",
};

function isFieldCode(code: string | undefined): code is FieldCode {
  return code !== undefined && Object.hasOwn(FIELD_FOR, code);
}

export function classifyError(error: unknown): SaveProblem {
  if (!(error instanceof ApiError)) return { kind: "generic" };
  if (error.status === 401) return { kind: "session" };
  if (isFieldCode(error.code))
    return { kind: "field", field: FIELD_FOR[error.code], code: error.code };
  return { kind: "generic" };
}
