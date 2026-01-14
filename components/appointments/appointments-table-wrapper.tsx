"use client"

import { AppointmentsDataTable } from "./data-table"
import { getColumns, AppointmentWithDoctor } from "./columns"
import { PatientType } from "@/lib/generated/prisma/enums"

interface AppointmentsTableWrapperProps {
  appointments: AppointmentWithDoctor[]
  doctors: { id: string; firstName: string; lastName: string }[]
  patientType: PatientType
}

export function AppointmentsTableWrapper({ 
  appointments, 
  doctors, 
  patientType 
}: AppointmentsTableWrapperProps) {
  const columns = getColumns(doctors, patientType)
  
  return (
    <AppointmentsDataTable
      columns={columns}
      data={appointments}
    />
  )
}
