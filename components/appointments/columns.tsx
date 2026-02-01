"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  APPOINTMENT_TYPES_MAP,
  appointmentTypeColors,
  statusLabels,
  statusStyles,
} from "@/config/constants"; // <--- IMPORTANTE
import {
  deleteAppointment,
  updateAppointmentStatus,
} from "@/lib/actions/appointments";
import {
  Appointment,
  AppointmentStatus,
  Doctor,
  PatientType,
} from "@/lib/generated/prisma/browser";
import { SerializedTariff } from "@/types/patient";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowUpDown,
  CalendarClock,
  CheckCircle,
  Clock,
  Edit,
  MoreHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EditAppointmentModal } from "./edit-appointment-modal";

// Tipo serializado para componentes cliente (convierte Decimal a number)
export type AppointmentWithDoctor = Omit<
  Appointment,
  "priceTotal" | "priceCopay" | "priceInsurer"
> & {
  priceTotal: number | null;
  priceCopay: number | null;
  priceInsurer: number | null;
  doctor: Doctor;
};

// Componente de celda de acciones con estado
function ActionsCell({
  appointment,
  doctors,
  patientType,
  tariffs,
  treatingDoctor,
}: {
  appointment: AppointmentWithDoctor;
  doctors: Doctor[];
  tariffs: SerializedTariff[];
  patientType: PatientType;
  treatingDoctor: Doctor;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleStatus = async (status: AppointmentStatus) => {
    const res = await updateAppointmentStatus(
      appointment.id,
      status,
      appointment.patientId,
    );
    if (res.success) toast.success("Estado actualizado");
    else toast.error("Error al actualizar");
  };

  const handleDelete = async () => {
    const res = await deleteAppointment(appointment.id, appointment.patientId);
    if (res.success) toast.success("Sesión eliminada");
    else toast.error(res.error);
    setDeleteOpen(false);
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

          {/* Si está agendada, mostrar editar y eliminar */}
          {appointment.status === AppointmentStatus.SCHEDULED && (
            <>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" /> Editar Sesión
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar Sesión
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatus(AppointmentStatus.COMPLETED)}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Marcar
                Asistida
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatus(AppointmentStatus.CANCELLED)}
              >
                <XCircle className="mr-2 h-4 w-4 text-red-600" /> Cancelar
                Sesión
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatus(AppointmentStatus.NO_SHOW)}
              >
                <Clock className="mr-2 h-4 w-4 text-slate-500" /> No Asistió
              </DropdownMenuItem>
            </>
          )}

          {/* Si está completada, cancelada o no asistió, permitir revertir */}
          {(appointment.status === AppointmentStatus.COMPLETED ||
            appointment.status === AppointmentStatus.CANCELLED ||
            appointment.status === AppointmentStatus.NO_SHOW) && (
            <>
              {appointment.status !== AppointmentStatus.COMPLETED && (
                <DropdownMenuItem
                  onClick={() => handleStatus(AppointmentStatus.COMPLETED)}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Marcar
                  Asistida
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatus(AppointmentStatus.SCHEDULED)}
              >
                <CalendarClock className="mr-2 h-4 w-4" /> Revertir a Agendada
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAppointmentModal
        appointment={appointment}
        patientType={patientType}
        tariffs={tariffs}
        doctors={doctors}
        treatingDoctor={treatingDoctor}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              ¿Eliminar Sesión?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La sesión será eliminada
              permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function getColumns(
  doctors: Doctor[],
  patientType: PatientType,
  tariffs: SerializedTariff[],
  treatingDoctor: Doctor,
): ColumnDef<AppointmentWithDoctor>[] {
  return [
    {
      accessorKey: "startTime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 font-semibold text-slate-700"
            style={{ paddingInline: "0px" }}
          >
            Fecha
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const startTime = new Date(row.original.startTime);

        return (
          <span className="font-medium text-muted-foreground text-sm">
            {format(startTime, "dd/MM/yyyy", { locale: es })}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        // value es un DateRange { from?: Date, to?: Date }
        if (!value?.from) return true;

        const rowDate = new Date(row.getValue(id) as string);
        const fromDate = new Date(value.from);
        fromDate.setHours(0, 0, 0, 0);

        if (value.to) {
          const toDate = new Date(value.to);
          toDate.setHours(23, 59, 59, 999);
          return rowDate >= fromDate && rowDate <= toDate;
        }

        // Solo fecha inicial
        const endOfDay = new Date(fromDate);
        endOfDay.setHours(23, 59, 59, 999);
        return rowDate >= fromDate && rowDate <= endOfDay;
      },
    },
    {
      id: "time",
      header: "Hora",
      cell: ({ row }) => {
        const startTime = new Date(row.original.startTime);
        const endTime = new Date(row.original.endTime);

        // Extraer horas y minutos de UTC sin conversión de zona horaria
        const startHours = String(startTime.getUTCHours()).padStart(2, "0");
        const startMinutes = String(startTime.getUTCMinutes()).padStart(2, "0");
        const endHours = String(endTime.getUTCHours()).padStart(2, "0");
        const endMinutes = String(endTime.getUTCMinutes()).padStart(2, "0");

        return (
          <span className="text-sm text-muted-foreground">
            {startHours}:{startMinutes} - {endHours}:{endMinutes}
          </span>
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 font-semibold text-slate-700"
            style={{ paddingInline: "0px" }}
          >
            Tipo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge
            variant="outline"
            className={appointmentTypeColors[type] || ""}
          >
            {APPOINTMENT_TYPES_MAP[type] || type}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id) as string;
        if (!value || value.length === 0) return true;
        if (Array.isArray(value)) {
          return value.includes(rowValue);
        }
        return rowValue === value;
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
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ActionsCell
          appointment={row.original}
          doctors={doctors}
          patientType={patientType}
          tariffs={tariffs}
          treatingDoctor={row.original.doctor}
        />
      ),
    },
  ];
}
