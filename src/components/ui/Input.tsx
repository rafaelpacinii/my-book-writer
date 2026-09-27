import React, { InputHTMLAttributes, forwardRef, useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    const borderStyle = error
      ? "border-danger focus-visible:outline-danger"
      : "border-control-border focus-visible:outline-primary";

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-12 px-3.5 rounded-lg bg-surface text-foreground placeholder:text-muted ` +
            `border text-sm transition-colors duration-150 ` +
            `focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-50 ${borderStyle} ${className}`}
          {...props}
        />
        {error ? (
          <span id={errorId} className="text-xs text-danger font-medium">
            {error}
          </span>
        ) : hint ? (
          <span className="text-xs text-muted">{hint}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
