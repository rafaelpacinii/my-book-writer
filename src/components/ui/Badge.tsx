import React, { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-primary-soft/40 text-muted",
  primary: "bg-primary-soft text-primary font-medium",
  success: "bg-success-soft text-success font-medium",
  warning: "bg-warning-soft text-warning font-medium",
  danger: "bg-danger-soft text-danger font-medium",
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center h-7 px-3 rounded-full text-xs transition-colors ${toneStyles[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
