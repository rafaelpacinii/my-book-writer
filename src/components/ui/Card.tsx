import React, { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = false, className = "", children, ...props }, ref) => {
    const base = "bg-surface rounded-xl border border-border p-5 text-foreground transition-all duration-150";
    const hover = interactive
      ? "hover:border-primary/60 hover:shadow-sm cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={`${base} ${hover} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
