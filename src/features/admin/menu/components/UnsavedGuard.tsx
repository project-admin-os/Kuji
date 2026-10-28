import { ConfirmDialog } from "../../settings/components/ConfirmDialog";
import { strings } from "../data/strings";
import { useUnsavedGuard } from "../hooks/useUnsavedGuard";

export function MenuUnsavedGuard() {
  const guard = useUnsavedGuard();
  const copy = strings[guard.locale];

  return (
    <ConfirmDialog
      open={guard.open}
      busy={false}
      title={copy.confirmLogoutTitle}
      text={copy.confirmLogoutText}
      labels={{ cancel: copy.keepWorking, confirm: copy.discardAndLogout, busy: copy.discardAndLogout }}
      onConfirm={guard.confirm}
      onCancel={guard.cancel}
    />
  );
}
