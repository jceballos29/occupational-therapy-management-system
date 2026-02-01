import { PatientTableWrapper } from "@/components/patients/patient-table-wrapper";
import { getPatients } from "@/lib/queries/patients";
import { Users } from "lucide-react";
import { AddPatientModal } from "@/components/patients/add-patient-modal";
import prisma from "@/lib/prisma";
import { HeaderPage } from "@/components/header-page";

export default async function PatientsPage() {
  // Llamada al Server Action
  const { data: patients, success, error } = await getPatients();

  // Obtener datos necesarios para el Dialog
  const insurers = await prisma.insurer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const doctors = await prisma.doctor.findMany({
    where: { active: true },
    orderBy: { lastName: "asc" },
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header de la Página */}
      <HeaderPage
        title="Pacientes"
        description="Gestiona el directorio de pacientes, afiliaciones e historias clínicas."
        icon={Users}
      />

      {/* Tabla de Datos */}
      {success && patients ? (
        <PatientTableWrapper
          patients={patients}
          insurers={insurers}
          doctors={doctors}
          actions={<AddPatientModal insurers={insurers} doctors={doctors} />}
        />
      ) : (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}
