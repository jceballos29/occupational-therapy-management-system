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