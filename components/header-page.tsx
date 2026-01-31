import { ArrowLeft, LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface HeaderPageProps {
  title: string;
  icon?: LucideIcon;
  backUrl?: string;
  backLabel?: string;
  actions?: ReactNode;
}

export function HeaderPage({
  title,
  icon: Icon,
  backUrl,
  backLabel = "Volver",
  actions,
}: HeaderPageProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {backUrl && (
          <Button asChild size="sm" variant="ghost">
            <Link href={backUrl}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}
