import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Authorization } from "@/lib/generated/prisma/browser";
import { cn, formatCOP } from "@/lib/utils";

export interface SectionCardsProps {
  isPrivate: boolean;
  sessionsLeft: number;
  totalPaid: number;
  totalAssisted: number;
  activeAuth?: Authorization;
}

export function SectionCards({
  isPrivate,
  sessionsLeft,
  totalPaid,
  totalAssisted,
  activeAuth,
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        className={cn(
          "shadow-sm rounded-lg p-4 gap-0 justify-between h-auto",
          isPrivate ? "bg-muted text-muted-foreground" : "",
        )}
      >
        <CardHeader className="p-0 ">
          <CardDescription className="font-medium text-xs">
            Sesiones Disponibles
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CardTitle className="text-xl font-semibold tabular-nums text-right pb-0 m-0">
            {isPrivate ? "---" : sessionsLeft}
          </CardTitle>
        </CardContent>
      </Card>
      <Card
        className={cn(
          "shadow-sm rounded-lg p-4 gap-0 justify-between h-auto",
          isPrivate ? "bg-muted text-muted-foreground" : "",
        )}
      >
        <CardHeader className="p-0">
          <CardDescription className="font-medium text-xs">
            Autorización Activa
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CardTitle className="text-xl font-semibold tabular-nums text-right">
            {activeAuth ? activeAuth.code : "---"}
          </CardTitle>
        </CardContent>
      </Card>
      <Card className="shadow-sm rounded-lg p-4 gap-0 justify-between h-auto">
        <CardHeader className="p-0">
          <CardDescription className="font-medium text-xs">
            Sesiones Asistidas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CardTitle className="text-xl font-semibold tabular-nums text-right">
            {totalAssisted}
          </CardTitle>
        </CardContent>
      </Card>
      <Card className="shadow-sm rounded-lg p-4 gap-0 justify-between h-auto">
        <CardHeader className="p-0">
          <CardDescription className="font-medium text-xs">
            Valor Total
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CardTitle className="text-xl font-semibold tabular-nums text-right">
            {formatCOP(totalPaid)}
          </CardTitle>
        </CardContent>
      </Card>
    </div>
  );
}
