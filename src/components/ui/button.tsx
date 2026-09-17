import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "danger";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary: "bg-cyan-600 text-white shadow-sm hover:bg-cyan-700",
  secondary:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  quiet: "bg-transparent text-slate-700 hover:bg-slate-100",
  danger: "bg-red-700 text-white hover:bg-red-800",
};
const sizes = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4",
  lg: "min-h-12 px-6 text-lg",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-control)] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
