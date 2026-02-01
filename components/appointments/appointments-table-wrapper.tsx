"use client";

import { AppointmentsDataTable } from "./data-table";
import { getColumns, AppointmentWithDoctor } from "./columns";
import { PatientType } from "@/lib/generated/prisma/enums";
import { AppointmentFilters } from "./appointment-filters";
import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import { Doctor } from "@/lib/generated/prisma/browser";
import { SerializedTariff } from "@/types/patient";

interface AppointmentsTableWrapperProps {
  appointments: AppointmentWithDoctor[];
  doctors: Doctor[];
  patientType: PatientType;
  tariffs: SerializedTariff[];
  treatingDoctor: Doctor;
}

// Hook que retorna filtros y tabla por separado
export function useAppointmentsTable({
  appointments,
  doctors,
  patientType,
  tariffs,
  treatingDoctor,
}: AppointmentsTableWrapperProps) {
  const columns = useMemo(
    () => getColumns(doctors, patientType, tariffs, treatingDoctor),
    [doctors, patientType, tariffs, treatingDoctor],
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: appointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: { pageSize: 5 },
    },
  });

  return {
    filters: <AppointmentFilters table={table} />,
    table: <AppointmentsDataTable columns={columns} data={appointments} />,
  };
}

// Componente legacy para compatibilidad
export function AppointmentsTableWrapper(props: AppointmentsTableWrapperProps) {
  const { table } = useAppointmentsTable(props);
  return table;
}
