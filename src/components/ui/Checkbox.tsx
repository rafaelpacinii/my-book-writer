import React, { InputHTMLAttributes, forwardRef, useId } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="flex items-start gap-2.5">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={`w-4 h-4 mt-0.5 rounded border-control-border text-primary accent-primary focus:ring-primary focus:ring-offset-surface cursor-pointer shrink-0 ${className}`}
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label htmlFor={inputId} className="text-xs font-bold text-foreground cursor-pointer select-none">
                {label}
              </label>
            )}
            {description && (
              <span className="text-xs text-muted select-none">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

