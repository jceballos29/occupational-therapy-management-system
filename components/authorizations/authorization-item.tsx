"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreVertical, CheckCircle, XCircle, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { updateAuthorizationStatus } from "@/lib/actions/authorizations";
import { EditAuthorizationDialog } from "../authorizations/edit-authorization-dialog";
import {
  Authorization,
  AuthorizationStatus,
} from "@/lib/generated/prisma/browser";

interface AuthorizationItemProps {
  auth: Authorization;
}

export function AuthorizationItem({ auth }: AuthorizationItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Función para manejar cambio de estado rápido
  const handleStatusChange = async (newStatus: AuthorizationStatus) => {
    const result = await updateAuthorizationStatus(
      auth.id,
      newStatus,
      auth.patientId
    );
    if (result.success) {
      toast.success(`Autorización marcada como ${newStatus}`);
    } else {
      toast.error("Error al actualizar estado");
    }
  };

  // Colores según estado
  const statusColors: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    ACTIVE: "default",
    COMPLETED: "secondary",
    EXPIRED: "destructive",
  };

  return (
    <>
      <div className="px-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
        {/* Info Izquierda */}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">Cód: {auth.code}</p>
            {auth.status === "ACTIVE" && (
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                Activa
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Vence: {format(auth.validUntil, "dd/MM/yyyy")}
          </p>
        </div>

        {/* Info Derecha + Menú */}
        <div className="flex items-center gap-4">
          {/* Barra de Progreso */}
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-2 mb-1 justify-end">
              <span className="text-xs font-medium text-slate-600">
                {auth.usedSessions} / {auth.totalSessions} usadas
              </span>
            </div>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full ml-auto overflow-hidden border">
              <div
                className={`h-full ${
                  auth.status === "ACTIVE" ? "bg-blue-600" : "bg-slate-400"
                }`}
                style={{
                  width: `${(auth.usedSessions / auth.totalSessions) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Menú de Acciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Gestionar</DropdownMenuLabel>

              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Editar Datos
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {auth.status !== "ACTIVE" && (
                <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />{" "}
                  Reactivar
                </DropdownMenuItem>
              )}

              {auth.status === "ACTIVE" && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("COMPLETED")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />{" "}
                    Completar (Forzar)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("EXPIRED")}
                  >
                    <XCircle className="mr-2 h-4 w-4 text-red-600" /> Anular /
                    Vencer
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modal de Edición (Oculto hasta que se active) */}
      <EditAuthorizationDialog
        authorization={auth}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
}
