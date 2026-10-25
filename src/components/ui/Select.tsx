import React, { SelectHTMLAttributes, forwardRef, useId } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  compact?: boolean;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, hint, icon: Icon, compact, containerClassName = "", className = "", id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    const borderStyle = error
      ? "border-danger focus-visible:outline-danger"
      : "border-control-border focus-visible:outline-primary";

    return (
      <div className={`flex w-full flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="text-xs font-bold text-foreground">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={`ui-select ${compact ? "ui-select-compact" : ""} ${Icon ? "ui-select-with-icon" : ""} ${borderStyle} ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface text-foreground py-1">
                  {opt.label}
                </option>
              ))
              : children}
          </select>
          {Icon && <Icon aria-hidden="true" className="ui-select-leading" size={15} />}
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>
        {error ? (
          <span id={errorId} className="text-xs text-danger font-medium">{error}</span>
        ) : hint ? (
          <span id={hintId} className="text-xs text-muted">{hint}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
