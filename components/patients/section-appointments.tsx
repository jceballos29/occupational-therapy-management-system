"use client";

import { DoctorListItem, PatientWithFullRelations } from "@/types/patient";
import { AddAppointmentModal } from "../appointments/add-appointment-modal";
import { useAppointmentsTable } from "../appointments/appointments-table-wrapper";
import { Calendar } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import { TableSkeleton } from "@/components/table-skeleton";

export interface SectionAppointmentsProps {
  patient: PatientWithFullRelations;
  doctors: DoctorListItem[];
  sessionsLeft?: number; // Sesiones disponibles en la autorización activa
  isPrivate: boolean; // Si es paciente privado
}

export function SectionAppointments({
  patient,
  doctors,
  sessionsLeft = 0,
  isPrivate,
}: SectionAppointmentsProps) {
  const mounted = useMounted();

  const { filters, table } = useAppointmentsTable({
    appointments: patient.appointments,
    doctors,
    patientType: patient.type,
  });

  const canCreateAppointment = isPrivate || sessionsLeft > 0;
  const disabledReason = isPrivate
    ? ""
    : sessionsLeft === 0
      ? "No hay autorización activa o se agotaron las sesiones"
      : "";

  // Evitar errores de hidratación
  if (!mounted) {
    return (
      <div className="space-y-4 pt-4">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {filters}
        <AddAppointmentModal
          patientId={patient.id}
          patientType={patient.type}
          doctors={doctors}
          tariffs={patient.insurer?.tariffs || []}
          disabled={!canCreateAppointment}
          disabledReason={disabledReason}
        />
      </div>

      {table}
    </div>
  );
}
