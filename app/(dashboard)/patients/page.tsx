import { Suspense } from "react"
import { getPatients } from "@/lib/queries/patients"
import { columns } from "./columns"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle, Users } from "lucide-react"
import Link from "next/link"

export default async function PatientsPage() {
  // Llamada al Server Action
  const { data: patients, success, error } = await getPatients()

  return (
    <div className="space-y-6">
      {/* Header de la Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-slate-600" />
            Pacientes
          </h1>
          <p className="text-slate-500">
            Gestiona el directorio de pacientes, afiliaciones e historias clínicas.
          </p>
        </div>
        <Button>
          <Link href="/patients/new" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Paciente
          </Link>
        </Button>
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
  )
}