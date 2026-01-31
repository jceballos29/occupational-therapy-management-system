import { DataTable } from "@/components/data-table";
import { getPatients } from "@/lib/queries/patients";
import { Users } from "lucide-react";
import { columns } from "./columns";
import { AddPatientDialog } from "@/components/patients/add-patient-dialog";
import prisma from "@/lib/prisma";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-slate-600" />
            Pacientes
          </h1>
          <p className="text-slate-500">
            Gestiona el directorio de pacientes, afiliaciones e historias
            clínicas.
          </p>
        </div>
        <AddPatientDialog insurers={insurers} doctors={doctors} />
      </div>

      {/* Tabla de Datos */}
      {success && patients ? (
        <DataTable columns={columns} data={patients} />
      ) : (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}
