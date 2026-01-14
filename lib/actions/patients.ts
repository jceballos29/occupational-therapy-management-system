'use server'

import prisma from "@/lib/prisma"
import { patientFormSchema, PatientFormValues } from "@/lib/schemas/patient"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Esta función puede ser llamada desde el cliente (Button onClick, Form onSubmit)
export async function createPatient(data: PatientFormValues) {
  // 1. Validar datos en el servidor
  const result = patientFormSchema.safeParse(data)
  
  if (!result.success) {
    return { success: false, error: "Datos inválidos" }
  }

  const { documentId, insurerId, treatingDoctorId, ...rest } = result.data

  try {
    // 2. Verificar duplicados
    const existing = await prisma.patient.findUnique({
      where: { documentId }
    })

    if (existing) {
      return { success: false, error: "Ya existe un paciente con este documento" }
    }

    // 3. Crear Paciente
    // Lógica: Si es Private, forzamos insurerId a null aunque venga algo
    const finalInsurerId = rest.type === 'PRIVATE' ? null : insurerId

    await prisma.patient.create({
      data: {
        ...rest,
        documentId,
        insurerId: finalInsurerId || null,
        treatingDoctorId: treatingDoctorId || null
      }
    })

  } catch (error) {
    console.error("Error creando paciente:", error)
    return { success: false, error: "Error interno al crear paciente" }
  }

  // 4. Revalidar y Redireccionar
  revalidatePath("/patients")
  redirect("/patients")
}

export async function updatePatient(id: string, data: PatientFormValues) {
  const result = patientFormSchema.safeParse(data)

  if (!result.success) {
    return { success: false, error: "Datos inválidos" }
  }

  const { documentId, insurerId, treatingDoctorId, ...rest } = result.data

  try {
    await prisma.$transaction(async (tx) => {
      
      // A. Validar documento duplicado
      const existingDoc = await tx.patient.findFirst({
        where: { documentId, NOT: { id: id } }
      })

      if (existingDoc) {
        throw new Error("Ya existe otro paciente con este documento")
      }

      // B. Obtener el paciente ACTUAL para comparar
      const currentPatient = await tx.patient.findUnique({
        where: { id },
        select: { insurerId: true, type: true }
      })

      if (!currentPatient) throw new Error("Paciente no encontrado")

      const finalInsurerId = rest.type === 'PRIVATE' ? null : insurerId

      // C. LÓGICA DE NEGOCIO ACTUALIZADA
      // 1. ¿Cambió la Aseguradora? (Ej: Sura -> Sanitas, o Sura -> Particular)
      // Nota: Si pasa a Particular, finalInsurerId es null, así que esto da true.
      const insurerChanged = currentPatient.insurerId !== finalInsurerId
      
      // 2. ¿Cambió el Tipo de Afiliación? (Ej: Copago -> Paquete)
      const typeChanged = currentPatient.type !== rest.type

      // Si cualquiera de los dos cambió, las autorizaciones viejas no sirven.
      if (insurerChanged || typeChanged) {
        
        await tx.authorization.updateMany({
          where: {
            patientId: id,
            status: 'ACTIVE'
          },
          data: {
            status: 'EXPIRED', // Se anulan
            // Opcional: podrías agregar un log interno si tuvieras una tabla de auditoría
          }
        })
      }

      // D. Actualizar Paciente
      await tx.patient.update({
        where: { id },
        data: {
          ...rest,
          documentId,
          insurerId: finalInsurerId || null,
          treatingDoctorId: treatingDoctorId || null
        }
      })
    })

    revalidatePath("/patients")
    revalidatePath(`/patients/${id}`)
    
    return { success: true }

  } catch (error: any) {
    console.error("Error actualizando paciente:", error)
    return { success: false, error: error.message || "Error interno al actualizar" }
  }
}