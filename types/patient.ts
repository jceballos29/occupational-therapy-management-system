import {
  AppointmentType,
  AppointmentStatus,
  Authorization,
  Doctor,
  Insurer,
  Patient,
  PatientType,
} from "@/lib/generated/prisma/client";

export type { Doctor, Insurer };

/**
 * Tipo para listas simplificadas de aseguradoras
 * Usado en selects y formularios
 */
export type InsurerListItem = Pick<Insurer, "id" | "name">;

/**
 * Tipo para listas simplificadas de doctores
 * Usado en selects y formularios
 */
export type DoctorListItem = Pick<Doctor, "id" | "firstName" | "lastName">;

export type PatientWithRelations = Patient & {
  insurer: Insurer;
  treatingDoctor: Doctor | null;
};

/**
 * Tipo para cita con doctor incluido y fechas/precios serializados
 */
export type SerializedAppointment = {
  id: string;
  type: AppointmentType;
  patientId: string;
  status: AppointmentStatus;
  notes: string | null;
  doctorId: string;
  authorizationId: string | null;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
  priceTotal: number | null;
  priceCopay: number | null;
  priceInsurer: number | null;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    colorCode: string | null;
    speciality: string;
    userId: string | null;
    active: boolean;
  };
};

/**
 * Tipo para tarifa serializada (con Decimales convertidos a números)
 */
export type SerializedTariff = {
  id: string;
  name: string;
  insurerId: string;
  type: PatientType;
  costTotal: number;
  copayAmount: number;
  insurerAmount: number;
  active: boolean;
};

/**
 * Tipo para paciente completo con todas sus relaciones
 */
export type PatientWithFullRelations = Omit<Patient, "appointments"> & {
  insurer: Insurer & {
    id: string;
    name: string;
    tariffs?: SerializedTariff[];
  };
  treatingDoctor: Doctor | null;
  authorizations: Authorization[];
  appointments: SerializedAppointment[];
};

/**
 * Tipo para las estadísticas agregadas de citas
 */
export type AppointmentStats = {
  _count: {
    id: number;
  };
  _sum: {
    priceTotal: number | null;
  };
};

/**
 * Tipo para el resultado completo de getPatientById()
 */
export type PatientByIdResult = {
  patient: PatientWithFullRelations;
  stats: AppointmentStats;
};

/**
 * Tipo para paciente usado en el sheet de información
 * Incluye solo las relaciones necesarias para mostrar datos básicos
 */
export type PatientForInfoSheet = Patient & {
  insurer: { name: string };
  treatingDoctor: {
    firstName: string;
    lastName: string;
    colorCode: string | null;
  } | null;
};
