import { DoctorListItem, PatientWithFullRelations } from "@/types/patient";
import { AddAppointmentModal } from "../appointments/add-appointment-modal";
import { AppointmentsTableWrapper } from "../appointments/appointments-table-wrapper";
import { Calendar } from "lucide-react";

export interface SectionAppointmentsProps {
  patient: PatientWithFullRelations;
  doctors: DoctorListItem[];
}

export function SectionAppointments({
  patient,
  doctors,
}: SectionAppointmentsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="scroll-m-20 text-lg font-semibold tracking-tight flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          Historial de Citas
        </h3>
        <AddAppointmentModal
          patientId={patient.id}
          patientType={patient.type}
          doctors={doctors}
        />
      </div>
      <AppointmentsTableWrapper
        appointments={patient.appointments}
        doctors={doctors}
        patientType={patient.type}
      />
    </div>
  );
}
