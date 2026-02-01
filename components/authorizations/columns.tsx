"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Pencil,
  ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { updateAuthorizationStatus } from "@/lib/actions/authorizations";
import { toast } from "sonner";
import {
  Authorization,
  AuthorizationStatus,
} from "@/lib/generated/prisma/browser";
import { useState } from "react";
import { EditAuthorizationDialog } from "./edit-authorization-dialog";

// Colores y labels para estados
const statusStyles: Record<AuthorizationStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
  EXPIRED: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<AuthorizationStatus, string> = {
  ACTIVE: "Activa",
  COMPLETED: "Completada",
  EXPIRED: "Vencida",
};

// Componente de celda de acciones con estado
function ActionsCell({
  authorization,
  insurerName,
}: {
  authorization: Authorization;
  insurerName: string;
}) {
  const [editOpen, setEditOpen] = useState(false);

  const handleStatus = async (status: AuthorizationStatus) => {
    const res = await updateAuthorizationStatus(
      authorization.id,
      status,
      authorization.patientId,
    );
    if (res.success)
      toast.success(`Estado actualizado a ${statusLabels[status]}`);
    else toast.error("Error al actualizar");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar Datos
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {authorization.status !== "ACTIVE" && (
            <DropdownMenuItem onClick={() => handleStatus("ACTIVE")}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Reactivar
            </DropdownMenuItem>
          )}

          {authorization.status === "ACTIVE" && (
            <>
              <DropdownMenuItem onClick={() => handleStatus("COMPLETED")}>
                <CheckCircle className="mr-2 h-4 w-4 text-blue-600" /> Completar
                (Forzar)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatus("EXPIRED")}>
                <XCircle className="mr-2 h-4 w-4 text-red-600" /> Anular /
                Vencer
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAuthorizationDialog
        authorization={authorization}
        insurerName={insurerName}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

export function getAuthorizationColumns(
  insurerName: string,
): ColumnDef<Authorization>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 font-semibold text-slate-700"
            style={{ paddingInline: "0px" }}
          >
            Código
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className="font-medium text-muted-foreground text-sm">
            {row.original.code}
          </span>
        );
      },
    },
    {
      accessorKey: "validFrom",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 font-semibold text-slate-700"
            style={{ paddingInline: "0px" }}
          >
            Fecha Inicio
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const validFrom = new Date(row.original.validFrom);
        return (
          <span className="text-sm text-muted-foreground">
            {format(validFrom, "dd/MM/yyyy", { locale: es })}
          </span>
        );
      },
    },
    {
      accessorKey: "validUntil",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 font-semibold text-slate-700"
            style={{ paddingInline: "0px" }}
          >
            Fecha Vencimiento
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const validUntil = new Date(row.original.validUntil);
        const isExpiringSoon =
          validUntil.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 &&
          validUntil.getTime() > Date.now();
        return (
          <span
            className={`text-sm ${
              isExpiringSoon
                ? "text-orange-600 font-medium"
                : "text-muted-foreground"
            }`}
          >
            {format(validUntil, "dd/MM/yyyy", { locale: es })}
          </span>
        );
      },
    },
    {
      id: "sessions",
      header: "Sesiones",
      cell: ({ row }) => {
        const { usedSessions, totalSessions, status } = row.original;
        const percentage = (usedSessions / totalSessions) * 100;

        return (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-xs text-right font-medium text-slate-600">
              {usedSessions} / {totalSessions} usadas
            </span>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border">
              <div
                className={`h-full transition-all ${
                  status === "ACTIVE" ? "bg-blue-600" : "bg-slate-400"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 font-semibold text-slate-700"
            style={{ paddingInline: "0px" }}
          >
            Estado
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant="outline" className={statusStyles[status] || ""}>
            {statusLabels[status] || status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ActionsCell authorization={row.original} insurerName={insurerName} />
      ),
    },
  ];
}
