'use server'

import prisma from "@/lib/prisma" // Asegúrate de que esta ruta sea la correcta para tu proyecto
import { appointmentSchema, AppointmentFormValues } from "@/lib/schemas/appointment"
import { revalidatePath } from "next/cache"
import { AppointmentStatus } from "../generated/prisma/enums"


// 1. CREAR CITA
export async function createAppointment(data: AppointmentFormValues) {
  const result = appointmentSchema.safeParse(data)
  
  if (!result.success) {
    return { success: false, error: "Datos inválidos: " + result.error.issues[0].message }
  }

  // IMPORTANTE: Agregamos copayAmount a la desestructuración
  const { date, time, duration, doctorId, patientId, type, price, description, copayAmount } = result.data

  // Construir fechas - Mantener la hora local sin convertir a UTC
  const [hours, minutes] = time.split(':').map(Number)
  
  // Obtener los componentes de fecha en la zona horaria local del cliente
  // La fecha ya viene del formulario en la zona local
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  
  // Crear la fecha en UTC usando los mismos valores numéricos
  // Esto asegura que 14:00 seleccionado se guarde como 14:00 UTC
  const startTime = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0))
  
  const endTime = new Date(startTime.getTime() + duration * 60000)

  try {
    await prisma.$transaction(async (tx) => {
        
        // ---------------------------------------------------------
        // A. VALIDACIÓN: EL PACIENTE NO PUEDE TENER 2 CITAS SIMULTÁNEAS
        // ---------------------------------------------------------
        const patientConflict = await tx.appointment.findFirst({
            where: {
                patientId, 
                status: { not: AppointmentStatus.CANCELLED },
                AND: [
                    { startTime: { lt: endTime } }, 
                    { endTime: { gt: startTime } }  
                ]
            }
        })

        if (patientConflict) {
            throw new Error("El paciente ya tiene otra cita agendada en este horario.")
        }

        // ---------------------------------------------------------
        // B. Lógica de Autorización (Para pacientes asegurados)
        // ---------------------------------------------------------
        const patient = await tx.patient.findUnique({ 
            where: { id: patientId },
            select: { type: true, insurerId: true }
        })

        if (!patient) throw new Error("Paciente no encontrado")

        let authorizationId = null

        if (patient.type !== 'PRIVATE') {
            const activeAuth = await tx.authorization.findFirst({
                where: {
                    patientId,
                    insurerId: patient.insurerId!,
                    status: 'ACTIVE'
                }
            })

            if (activeAuth) {
                authorizationId = activeAuth.id
            }
        }

        // ---------------------------------------------------------
        // C. CÁLCULO FINANCIERO (Lógica de Copago)
        // ---------------------------------------------------------
        let finalPriceTotal = price 
        let finalPriceCopay = 0
        let finalPriceInsurer = 0

        if (patient.type === 'PRIVATE') {
            finalPriceCopay = 0
            finalPriceInsurer = 0
        } 
        else if (patient.type === 'INSURANCE_COPAY') {
            finalPriceCopay = copayAmount || 0
            finalPriceInsurer = finalPriceTotal - finalPriceCopay
            
            if (finalPriceInsurer < 0) throw new Error("Error financiero: El copago excede el total")
        } 
        else if (patient.type === 'INSURANCE_PACKAGE') {
            finalPriceCopay = copayAmount || 0
            finalPriceInsurer = finalPriceTotal - finalPriceCopay
        }

        // ---------------------------------------------------------
        // D. Crear la Cita (Guardando todos los valores)
        // ---------------------------------------------------------
        await tx.appointment.create({
            data: {
                patientId,
                doctorId,
                startTime,
                endTime,
                type,
                status: AppointmentStatus.SCHEDULED,
                notes: description,
                authorizationId,
                
                // --- AQUÍ ESTABA EL FALTANTE ---
                priceTotal: finalPriceTotal,    // Valor Total
                priceCopay: finalPriceCopay,    // Lo que paga el paciente
                priceInsurer: finalPriceInsurer // Lo que se factura a la EPS
            }
        })
    })

    revalidatePath(`/patients/${patientId}`)
    return { success: true }

  } catch (error: any) {
    console.error("Error creating appointment:", error)
    return { success: false, error: error.message || "Error al agendar cita" }
  }
}

// 2. CAMBIAR ESTADO
export async function updateAppointmentStatus(id: string, status: AppointmentStatus, patientId: string) {
  try {
    await prisma.$transaction(async (tx) => {
        const appointment = await tx.appointment.findUnique({
            where: { id },
            include: { authorization: true }
        })

        if (!appointment) throw new Error("Cita no encontrada")

        // Sumar sesión al completar
        if (status === AppointmentStatus.COMPLETED && appointment.status !== AppointmentStatus.COMPLETED) {
            if (appointment.authorizationId) {
                await tx.authorization.update({
                    where: { id: appointment.authorizationId },
                    data: { usedSessions: { increment: 1 } }
                })
            }
        }

        // Restar sesión si se revierte (corrección)
        if (appointment.status === AppointmentStatus.COMPLETED && status !== AppointmentStatus.COMPLETED) {
             if (appointment.authorizationId) {
                await tx.authorization.update({
                    where: { id: appointment.authorizationId },
                    data: { usedSessions: { decrement: 1 } }
                })
            }
        }

        await tx.appointment.update({
            where: { id },
            data: { status }
        })
    })

    revalidatePath(`/patients/${patientId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Error actualizando estado" }
  }
}

// 3. ELIMINAR CITA
export async function deleteAppointment(id: string, patientId: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { status: true }
    })

    if (!appointment) {
      return { success: false, error: "Cita no encontrada" }
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      return { success: false, error: "Solo se pueden eliminar citas agendadas" }
    }

    await prisma.appointment.delete({ where: { id } })
    
    revalidatePath(`/patients/${patientId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return { success: false, error: "Error al eliminar cita" }
  }
}

// 4. ACTUALIZAR CITA
export async function updateAppointment(id: string, data: AppointmentFormValues) {
  const result = appointmentSchema.safeParse(data)
  
  if (!result.success) {
    console.error("Validation errors:", result.error.flatten())
    return { success: false, error: "Datos inválidos: " + result.error.issues[0].message }
  }

  const { date, time, duration, doctorId, patientId, type, price, description, copayAmount } = result.data

  // Construir fechas
  const [hours, minutes] = time.split(':').map(Number)
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const startTime = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0))
  const endTime = new Date(startTime.getTime() + duration * 60000)

  try {
    await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({
        where: { id },
        select: { status: true, patientId: true }
      })

      if (!appointment) throw new Error("Cita no encontrada")
      if (appointment.status !== AppointmentStatus.SCHEDULED) {
        throw new Error("Solo se pueden editar citas agendadas")
      }

      // Validar conflictos (excluyendo la cita actual)
      const patientConflict = await tx.appointment.findFirst({
        where: {
          patientId,
          id: { not: id },
          status: { not: AppointmentStatus.CANCELLED },
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } }
          ]
        }
      })

      if (patientConflict) {
        throw new Error("El paciente ya tiene otra cita agendada en este horario.")
      }

      // Obtener info del paciente para cálculos financieros
      const patient = await tx.patient.findUnique({
        where: { id: patientId },
        select: { type: true, insurerId: true }
      })

      if (!patient) throw new Error("Paciente no encontrado")

      // Obtener autorización activa si aplica
      let authorizationId = null
      if (patient.type !== 'PRIVATE') {
        const activeAuth = await tx.authorization.findFirst({
          where: {
            patientId,
            insurerId: patient.insurerId!,
            status: 'ACTIVE'
          }
        })
        if (activeAuth) authorizationId = activeAuth.id
      }

      // Cálculo financiero
      let finalPriceTotal = price
      let finalPriceCopay = 0
      let finalPriceInsurer = 0

      if (patient.type === 'PRIVATE') {
        finalPriceCopay = 0
        finalPriceInsurer = 0
      } else if (patient.type === 'INSURANCE_COPAY') {
        finalPriceCopay = copayAmount || 0
        finalPriceInsurer = finalPriceTotal - finalPriceCopay
        if (finalPriceInsurer < 0) throw new Error("Error financiero: El copago excede el total")
      } else if (patient.type === 'INSURANCE_PACKAGE') {
        finalPriceCopay = copayAmount || 0
        finalPriceInsurer = finalPriceTotal - finalPriceCopay
      }

      await tx.appointment.update({
        where: { id },
        data: {
          doctorId,
          startTime,
          endTime,
          type,
          notes: description,
          authorizationId,
          priceTotal: finalPriceTotal,
          priceCopay: finalPriceCopay,
          priceInsurer: finalPriceInsurer
        }
      })
    })

    revalidatePath(`/patients/${patientId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error updating appointment:", error)
    return { success: false, error: error.message || "Error al actualizar cita" }
  }
}