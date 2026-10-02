import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

/**
 * Canonical form field wrapper — label + control + hint/error.
 * Use for every CRM and public form control.
 */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-flora-foreground"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-flora-primary">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-flora-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-flora-muted">{hint}</p>
      ) : null}
    </div>
  );
}
