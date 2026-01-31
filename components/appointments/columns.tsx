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
  Clock,
  CalendarClock,
  Edit,
  Trash2,
  AlertTriangle,
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
import {
  updateAppointmentStatus,
  deleteAppointment,
} from "@/lib/actions/appointments";
import { toast } from "sonner";
import {
  APPOINTMENT_TYPES_MAP,
  appointmentTypeColors,
  statusLabels,
  statusStyles,
} from "@/config/constants"; // <--- IMPORTANTE
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  Doctor,
  PatientType,
} from "@/lib/generated/prisma/browser";
import { useState } from "react";
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
}: {
  appointment: AppointmentWithDoctor;
  doctors: { id: string; firstName: string; lastName: string }[];
  patientType: PatientType;
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
        appointment={{
          id: appointment.id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          startTime: appointment.startTime,
          type: appointment.type as AppointmentType,
          priceTotal: appointment.priceTotal,
          priceCopay: appointment.priceCopay,
          notes: appointment.notes,
        }}
        patientType={patientType}
        doctors={doctors}
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
  doctors: { id: string; firstName: string; lastName: string }[],
  patientType: PatientType,
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
      accessorKey: "doctor",
      header: "Profesional",
      cell: ({ row }) => {
        const doctor = row.original.doctor;
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: doctor.colorCode || "gray" }}
            />
            <span className="text-sm">Dr. {doctor.lastName}</span>
          </div>
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
        />
      ),
    },
  ];
}
