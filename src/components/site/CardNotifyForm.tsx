import { useId, useState } from "react";
import { AlbaButton } from "./AlbaButton";
import { useI18n } from "@/lib/i18n";

export type CardInterest = { name: string; phone: string; email?: string };

/**
 * Physical-card interest form.
 *
 * PHASE 1: there is no approved backend, so the form renders CLOSED: fields are
 * visible but disabled, and the reason is stated. Nothing is collected and no
 * success message can appear.
 *
 * To open it later, pass a real `onSubmit` that durably saves the data and
 * throws on failure. Success is shown only after `onSubmit` resolves.
 * Consent wording and privacy terms must be added before opening it.
 */
export function CardNotifyForm({ onSubmit }: { onSubmit?: (data: CardInterest) => Promise<void> }) {
  const { t } = useI18n();
  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    phone: `${uid}-phone`,
    email: `${uid}-email`,
    status: `${uid}-status`,
  };
  const open = typeof onSubmit === "function";

  // Values live here, so switching EN/SW never clears what was typed.
  const [values, setValues] = useState({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "saved" | "failed">("idle");

  if (state === "saved") {
    return (
      <p
        role="status"
        className="rounded-2xl border-2 border-alba-green p-5 text-base font-semibold"
      >
        {t("form.success")}
      </p>
    );
  }

  const validate = () => {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = t("form.err.name");
    if (values.phone.replace(/\D/g, "").length < 9) next.phone = t("form.err.phone");
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email))
      next.email = t("form.err.email");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const field = (key: keyof typeof values, label: string, type: string, autoComplete: string) => {
    const errorId = `${ids[key]}-error`;
    const error = errors[key];
    return (
      <div>
        <label htmlFor={ids[key]} className="block text-sm font-semibold">
          {label}
        </label>
        <input
          id={ids[key]}
          type={type}
          autoComplete={autoComplete}
          value={values[key]}
          onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error ? errorId : null, open ? null : ids.status].filter(Boolean).join(" ") ||
            undefined
          }
          className="mt-2 h-12 w-full rounded-xl border-2 border-input bg-card px-4 text-base outline-none focus:border-ring disabled:cursor-not-allowed disabled:bg-secondary"
        />
        {error ? (
          <p id={errorId} className="mt-1.5 text-sm font-semibold text-destructive">
            <span aria-hidden>! </span>
            {error}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <form
      noValidate
      aria-labelledby={`${uid}-title`}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!open || !validate()) return;
        setState("sending");
        try {
          await onSubmit({
            name: values.name.trim(),
            phone: values.phone.trim(),
            ...(values.email.trim() ? { email: values.email.trim() } : {}),
          });
          setState("saved");
        } catch {
          setState("failed");
        }
      }}
    >
      <h3 id={`${uid}-title`} className="font-display text-xl font-extrabold">
        {t("form.title")}
      </h3>
      {!open ? (
        <p id={ids.status} className="mt-2 text-base text-muted-foreground">
          {t("form.closed")}
        </p>
      ) : null}

      <fieldset disabled={!open || state === "sending"} className="mt-5 grid gap-4">
        {field("name", t("form.name"), "text", "name")}
        {field("phone", t("form.phone"), "tel", "tel")}
        {field("email", t("form.email"), "email", "email")}
        <div>
          <AlbaButton type="submit" variant="outline">
            {state === "sending" ? t("form.sending") : t("form.submit")}
          </AlbaButton>
        </div>
      </fieldset>

      {state === "failed" ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-destructive">
          {t("form.failed")}
        </p>
      ) : null}
    </form>
  );
}
