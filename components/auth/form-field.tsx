import type { InputHTMLAttributes } from "react";

export function FormField({
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
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20 ${
          error ? "border-red-400" : "border-border"
        }`}
      />
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
