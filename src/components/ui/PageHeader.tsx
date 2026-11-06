import React, { ElementType } from "react";
import { typography } from "@/lib/design-system";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ElementType;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  badge,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
    >
      <div>
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h1 className={typography.pageTitle}>{title}</h1>
          {badge}
        </div>
        {description && (
          <p className={typography.pageHeaderDescription}>{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  );
}
