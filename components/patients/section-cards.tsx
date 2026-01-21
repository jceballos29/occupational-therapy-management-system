import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Authorization } from "@/lib/generated/prisma/browser";
import { formatCOP } from "@/lib/utils";

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
        className={
          isPrivate ? "shadow-none bg-muted text-muted-foreground" : ""
        }
      >
        <CardHeader>
          <CardDescription className="font-medium text-xs">
            Sesiones Disponibles
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-right">
            {isPrivate ? "---" : sessionsLeft}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card
        className={
          isPrivate ? "shadow-none bg-muted text-muted-foreground" : ""
        }
      >
        <CardHeader>
          <CardDescription className="font-medium text-xs">
            Autorización Activa
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-right">
            {activeAuth ? activeAuth.code : "---"}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription className="font-medium text-xs">
            Sesiones Asistidas
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-right">
            {totalAssisted}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription className="font-medium text-xs">
            Valor Total
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums text-right">
            {formatCOP(totalPaid)}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
