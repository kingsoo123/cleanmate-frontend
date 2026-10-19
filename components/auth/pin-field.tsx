import type { InputHTMLAttributes } from "react";

export function PinField({
  label,
  error,
  ...inputProps
}: {
  label: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = inputProps.id ?? inputProps.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {inputProps.required ? (
          <span className="text-brand" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      <input
        {...inputProps}
        id={id}
        type="password"
        inputMode="numeric"
        autoComplete={inputProps.autoComplete ?? "new-password"}
        maxLength={6}
        pattern="\d{6}"
        placeholder="6-digit PIN"
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm tracking-[0.35em] text-foreground outline-none transition-colors placeholder:tracking-normal placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20 ${
          error ? "border-red-400" : "border-border"
        }`}
      />
      <p className="text-xs text-muted">
        Choose a 6-digit PIN. You will use it with your phone number to sign in.
      </p>
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
