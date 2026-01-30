'use server'

import prisma from "@/lib/prisma"
import { authorizationSchema, AuthorizationFormValues } from "@/lib/schemas/authorization"
import { revalidatePath } from "next/cache"
import { AuthorizationStatus } from "../generated/prisma/enums"

export async function createAuthorization(data: AuthorizationFormValues) {
  const result = authorizationSchema.safeParse(data)

  if (!result.success) {
    return { success: false, error: "Datos inválidos" }
  }

  const { code, insurerId, patientId, totalSessions, validFrom, validUntil, previousAuthAction } = result.data

  try {
    await prisma.$transaction(async (tx) => {
      
      // 1. Validar unicidad
      const existing = await tx.authorization.findUnique({
        where: { code_insurerId: { code, insurerId } }
      })

      if (existing) {
        throw new Error("Este código ya existe para esta aseguradora.")
      }

      // 2. BUSCAR ACTIVA Y RESOLVER CONFLICTO
      const activeAuth = await tx.authorization.findFirst({
        where: { patientId, insurerId, status: 'ACTIVE' }
      })

      if (activeAuth) {
        // Si hay activa, es OBLIGATORIO que el usuario haya decidido qué hacer
        if (!previousAuthAction) {
           throw new Error("Existe una autorización activa. Debes decidir qué hacer con ella.")
        }

        // Cerramos la anterior con el estado que eligió el usuario
        await tx.authorization.update({
          where: { id: activeAuth.id },
          data: { status: previousAuthAction }
        })
      }

      // 3. Crear la nueva
      await tx.authorization.create({
        data: {
          code, insurerId, patientId, totalSessions,
          usedSessions: 0, validFrom, validUntil,
          status: 'ACTIVE'
        }
      })
    })

    revalidatePath(`/patients/${patientId}`)
    return { success: true }

  } catch (error: any) {
    console.error("Error creando autorización:", error)
    return { success: false, error: error.message || "Error interno" }
  }
}

export async function updateAuthorizationStatus(id: string, status: AuthorizationStatus, patientId: string) {
  try {
    await prisma.authorization.update({
      where: { id },
      data: { status }
    })
    
    revalidatePath(`/patients/${patientId}`)
    return { success: true }
  } catch (error) {
    console.error("Error actualizando estado:", error)
    return { success: false, error: "No se pudo actualizar el estado" }
  }
}

// 2. Acción Completa: Editar Datos (Corregir error)
export async function updateAuthorization(id: string, data: AuthorizationFormValues) {
  const result = authorizationSchema.safeParse(data)

  if (!result.success) {
    return { success: false, error: "Datos inválidos" }
  }

  try {
    // Validamos si el código ya existe EN OTRA autorización distinta a esta
    const existing = await prisma.authorization.findFirst({
      where: {
        code: data.code,
        insurerId: data.insurerId,
        NOT: { id: id } // Excluir la actual
      }
    })

    if (existing) {
      return { success: false, error: "Ese código ya está en uso en otra autorización." }
    }

    await prisma.authorization.update({
      where: { id },
      data: {
        code: data.code,
        totalSessions: data.totalSessions,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        // No actualizamos usedSessions ni status aquí por seguridad
      }
    })

    revalidatePath(`/patients/${data.patientId}`)
    return { success: true }

  } catch (error) {
    console.error("Error editando autorización:", error)
    return { success: false, error: "Error al guardar cambios" }
  }
}