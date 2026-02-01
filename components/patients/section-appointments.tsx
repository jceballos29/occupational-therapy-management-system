"use client";

import { PatientWithFullRelations } from "@/types/patient";
import { AddAppointmentModal } from "../appointments/add-appointment-modal";
import { useAppointmentsTable } from "../appointments/appointments-table-wrapper";
import { useMounted } from "@/hooks/use-mounted";
import { TableSkeleton } from "@/components/table-skeleton";
import { Doctor } from "@/lib/generated/prisma/browser";

export interface SectionAppointmentsProps {
  patient: PatientWithFullRelations;
  doctors: Doctor[];
  sessionsLeft?: number;
  isPrivate: boolean;
}

export function SectionAppointments({
  patient,
  doctors,
  sessionsLeft = 0,
  isPrivate,
}: SectionAppointmentsProps) {
  const mounted = useMounted();

  const canCreateAppointment = isPrivate || sessionsLeft > 0;
  const disabledReason = isPrivate
    ? ""
    : sessionsLeft === 0
      ? "No hay autorización activa o se agotaron las sesiones"
      : "";

  const { table } = useAppointmentsTable({
    appointments: patient.appointments,
    doctors,
    patientType: patient.type,
    tariffs: patient.insurer?.tariffs || [],
    treatingDoctor: patient.treatingDoctor,
    actions: (
      <AddAppointmentModal
        patientId={patient.id}
        patientType={patient.type}
        doctors={doctors}
        treatingDoctor={patient.treatingDoctor}
        tariffs={patient.insurer?.tariffs || []}
        disabled={!canCreateAppointment}
        disabledReason={disabledReason}
      />
    ),
  });

  // Evitar errores de hidratación
  if (!mounted) {
    return (
      <section className="space-y-4 pt-4">
        <TableSkeleton />
      </section>
    );
  }

  return <section className="space-y-4 pt-4">{table}</section>;
}
