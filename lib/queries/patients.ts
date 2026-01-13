import prisma from "@/lib/prisma" // Asegúrate que esta ruta apunte a tu instancia de prisma
import { ActionResponse } from "@/types/action"
import { PatientWithRelations } from "@/types/patient"

// Esta función se ejecuta solo en el servidor (Server Components)
export async function getPatients(): Promise<ActionResponse<PatientWithRelations[]>> {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        insurer: true,        // Traer datos de la aseguradora
        treatingDoctor: true  // Traer datos del médico tratante
      },
      orderBy: {
        createdAt: 'desc'     // Los más recientes primero
      }
    })

    return { success: true, data: patients }
  } catch (error) {
    console.error("Error al obtener pacientes:", error)
    return { success: false, error: "No se pudieron cargar los pacientes." }
  }
}

export async function getPatientById(id: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        insurer: true,
        treatingDoctor: true,
        authorizations: {
          orderBy: { createdAt: 'desc' } // Las más recientes primero
        },
        appointments: {
          take: 5, // Solo las últimas 5 citas para el historial rápido
          orderBy: { startTime: 'desc' },
          include: { doctor: true }
        }
      }
    })
    
    if (!patient) return { success: false, error: "Paciente no encontrado" }
    
    return { success: true, data: patient }
  } catch (error) {
    console.error("Error fetching patient:", error)
    return { success: false, error: "Error de servidor" }
  }
}