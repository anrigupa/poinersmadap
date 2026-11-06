import React, { ElementType } from "react";
import { badges, cards } from "@/lib/design-system";

export type StatBadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatCardProps {
  value: string | number;
  label: string;
  description?: string;
  badgeText?: string;
  badgeVariant?: StatBadgeVariant;
  icon?: ElementType;
  iconClassName?: string;
  onClick?: () => void;
  className?: string;
}

export default function StatCard({
  value,
  label,
  description,
  badgeText,
  badgeVariant = "info",
  icon: Icon,
  iconClassName = "bg-blue-50 text-blue-700 border-blue-200",
  onClick,
  className = "",
}: StatCardProps) {
  const badgeClasses = badges[`compact${badgeVariant.charAt(0).toUpperCase() + badgeVariant.slice(1)}` as keyof typeof badges] || badges.compactInfo;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition-all flex flex-col justify-between ${
        onClick ? "hover:shadow-md hover:border-blue-400 cursor-pointer group" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        {badgeText ? (
          <span className={badgeClasses}>{badgeText}</span>
        ) : (
          <span />
        )}
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconClassName} ${
              onClick ? "group-hover:scale-105" : ""
            } transition-transform`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        {/* Value (Hierarchy Step 1) */}
        <div className={cards.statValue}>{value}</div>

        {/* Label (Hierarchy Step 2) */}
        <div className={cards.statLabel}>{label}</div>

        {/* Description (Hierarchy Step 3) */}
        {description && (
          <p className={cards.statDescription}>{description}</p>
        )}
      </div>
    </div>
  );
}

export { StatCard as StatsCard };

