import React, { ElementType } from "react";
import { badges } from "@/lib/design-system";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "default" | "sm";
  icon?: ElementType;
  className?: string;
}

export default function Badge({
  children,
  variant = "info",
  size = "default",
  icon: Icon,
  className = "",
}: BadgeProps) {
  const isSm = size === "sm";
  const variantCapitalized = variant.charAt(0).toUpperCase() + variant.slice(1);
  const baseKey = isSm ? `compact${variantCapitalized}` : variant;
  const baseClasses = badges[baseKey as keyof typeof badges] || badges.info;

  return (
    <span className={`${baseClasses} ${className}`}>
      {Icon && <Icon className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      <span>{children}</span>
    </span>
  );
}
