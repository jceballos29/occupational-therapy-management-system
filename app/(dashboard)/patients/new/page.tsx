import prisma from "@/lib/prisma"
import { PatientForm } from "@/components/patients/patient-form"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { UserPlus } from "lucide-react"

export default async function NewPatientPage() {
  // 1. Obtener datos necesarios para los Selects (Server-side fetching)
  const insurers = await prisma.insurer.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  const doctors = await prisma.doctor.findMany({
    where: { active: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: 'asc' }
  })

  return (
    <div className="space-y-6">
        {/* Breadcrumb de navegación */}
        {/* <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/patients">Pacientes</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Nuevo Registro</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb> */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-slate-600" />
            Registrar Nuevo Paciente
          </h1>
          <p className="text-slate-500">
            Ingresa los datos personales y de afiliación del paciente.
          </p>
        </div>
        {/* <Button>
          <Link href="/patients/new" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Paciente
          </Link>
        </Button> */}
      </div>

        {/* <div className="bg-white rounded-xl border shadow-sm p-6 max-w-4xl"> */}
        
            <PatientForm insurers={insurers} doctors={doctors} />
        {/* </div> */}
    </div>
  )
}