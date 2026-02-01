"use client";

import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { PatientFilters } from "./patient-filters";
import { PatientWithRelations } from "@/types/patient";

interface PatientTableWrapperProps {
  patients: PatientWithRelations[];
  insurers: { id: string; name: string; isPrivate: boolean }[];
  doctors: { id: string; firstName: string; lastName: string }[];
  actions?: React.ReactNode;
}

export function PatientTableWrapper({
  patients,
  insurers,
  doctors,
  actions,
}: PatientTableWrapperProps) {
  return (
    <DataTable
      columns={columns}
      data={patients}
      filters={(table) => (
        <PatientFilters table={table} insurers={insurers} doctors={doctors} />
      )}
      actions={actions}
    />
  );
}
