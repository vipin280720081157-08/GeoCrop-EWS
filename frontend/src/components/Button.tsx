import React from "react";
import type { LucideIcon } from "lucide-react";

type Variant = "primary" | "secondary" | "success" | "danger" | "outline" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: LucideIcon;
  size?: "sm" | "md";
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-white border-primary hover:brightness-95",
  secondary: "bg-secondary text-white border-secondary hover:brightness-95",
  success: "bg-success text-white border-success hover:brightness-95",
  danger: "bg-error text-white border-error hover:brightness-95",
  outline: "bg-white text-textPrimary border-borderC hover:bg-bg",
  ghost: "bg-transparent text-textPrimary border-transparent hover:bg-bg",
};

export default function Button({ variant = "primary", icon: Icon, size = "md", className = "", children, disabled, ...rest }: ButtonProps) {
  const h = size === "sm" ? "h-9" : "h-11";
  const disabledClasses = disabled ? "!bg-gray-200 !text-textDisabled !border-gray-200 cursor-not-allowed" : "cursor-pointer";
  return (
    <button
      disabled={disabled}
      className={`${h} px-4 rounded-lg border font-medium text-[15px] inline-flex items-center gap-2 transition active:scale-[0.98] ${VARIANT_CLASSES[variant]} ${disabledClasses} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={16} strokeWidth={2} />}
      {children}
    </button>
  );
}
