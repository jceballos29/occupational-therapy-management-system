"use client";

import { DataTable } from "@/components/data-table";
import { getColumns, AppointmentWithDoctor } from "./columns";
import { PatientType } from "@/lib/generated/prisma/enums";
import { AppointmentFilters } from "./appointment-filters";
import { useMemo } from "react";
import { Doctor } from "@/lib/generated/prisma/browser";
import { SerializedTariff } from "@/types/patient";
import { SortingState } from "@tanstack/react-table";

interface AppointmentsTableWrapperProps {
  appointments: AppointmentWithDoctor[];
  doctors: Doctor[];
  patientType: PatientType;
  tariffs: SerializedTariff[];
  treatingDoctor: Doctor;
  actions?: React.ReactNode;
}

export function AppointmentsTableWrapper({
  appointments,
  doctors,
  patientType,
  tariffs,
  treatingDoctor,
  actions,
}: AppointmentsTableWrapperProps) {
  const columns = useMemo(
    () => getColumns(doctors, patientType, tariffs, treatingDoctor),
    [doctors, patientType, tariffs, treatingDoctor],
  );

  // Ordenar por fecha más reciente por defecto
  const defaultSort: SortingState = [{ id: "startTime", desc: true }];

  return (
    <DataTable
      columns={columns}
      data={appointments}
      filters={(table) => <AppointmentFilters table={table} />}
      actions={actions}
      defaultSort={defaultSort}
    />
  );
}

// Hook para uso externo - retorna tabla con filtros y actions integrados
export function useAppointmentsTable({
  appointments,
  doctors,
  patientType,
  tariffs,
  treatingDoctor,
  actions,
}: AppointmentsTableWrapperProps) {
  const columns = useMemo(
    () => getColumns(doctors, patientType, tariffs, treatingDoctor),
    [doctors, patientType, tariffs, treatingDoctor],
  );

  const defaultSort: SortingState = [{ id: "startTime", desc: true }];

  return {
    table: (
      <DataTable
        columns={columns}
        data={appointments}
        filters={(table) => <AppointmentFilters table={table} />}
        actions={actions}
        defaultSort={defaultSort}
      />
    ),
  };
}
