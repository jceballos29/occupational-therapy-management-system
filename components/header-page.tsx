import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface HeaderPageProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}

export function HeaderPage({
  title,
  description,
  icon: Icon,
  actions,
}: HeaderPageProps) {
  return (
    <>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
    {description && (
      <p className="text-sm text-muted-foreground">{description}</p>
    )}
    </>
  );
}
