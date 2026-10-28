export function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-caption text-error" role="alert">{message}</p> : null;
}
