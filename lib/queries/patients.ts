import prisma from "@/lib/prisma"; // Asegúrate que esta ruta apunte a tu instancia de prisma
import { ActionResponse } from "@/types/action";
import { PatientWithRelations } from "@/types/patient";

// Esta función se ejecuta solo en el servidor (Server Components)
export async function getPatients(): Promise<
  ActionResponse<PatientWithRelations[]>
> {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        insurer: true, // Traer datos de la aseguradora
        treatingDoctor: true, // Traer datos del médico tratante
      },
      orderBy: {
        createdAt: "desc", // Los más recientes primero
      },
    });

    return { success: true, data: patients };
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    return { success: false, error: "No se pudieron cargar los pacientes." };
  }
}

export async function getPatientById(id: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        insurer: {
          include: {
            tariffs: {
              where: { active: true },
            },
          },
        },
        treatingDoctor: true,
        authorizations: {
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          orderBy: { startTime: "desc" },
          include: { doctor: true },
        },
      },
    });

    if (!patient) return { success: false, error: "Paciente no encontrado" };

    // NUEVO: Calculamos estadísticas históricas
    const stats = await prisma.appointment.aggregate({
      where: {
        patientId: id,
        status: "COMPLETED", // Solo contamos las completadas
      },
      _count: { id: true },
      _sum: { priceTotal: true },
    });

    // Convertir Decimales a números para evitar problemas de serialización
    const serializedPatient = {
      ...patient,
      // Serializar tarifas de la aseguradora si existen
      insurer: {
        ...patient.insurer,
        tariffs:
          patient.insurer.tariffs?.map((tariff) => ({
            ...tariff,
            type: tariff.type,
            costTotal: Number(tariff.costTotal),
            copayAmount: Number(tariff.copayAmount),
            insurerAmount: Number(tariff.insurerAmount),
          })) || [],
      },
      appointments: patient.appointments.map((appointment) => ({
        ...appointment,
        // Convertir strings de fecha a objetos Date
        startTime: new Date(appointment.startTime),
        endTime: new Date(appointment.endTime),
        createdAt: new Date(appointment.createdAt),
        updatedAt: new Date(appointment.updatedAt),
        // Convertir Decimales a números
        priceTotal: appointment.priceTotal
          ? Number(appointment.priceTotal)
          : null,
        priceCopay: appointment.priceCopay
          ? Number(appointment.priceCopay)
          : null,
        priceInsurer: appointment.priceInsurer
          ? Number(appointment.priceInsurer)
          : null,
      })),
    };

    // Devolvemos el paciente serializado y las estadísticas por separado
    return { success: true, data: { patient: serializedPatient, stats } };
  } catch (error) {
    console.error("Error fetching patient:", error);
    return { success: false, error: "Error de servidor" };
  }
}
