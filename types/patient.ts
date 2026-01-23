import {
  AppointmentType,
  AppointmentStatus,
  Authorization,
  Doctor,
  Insurer,
  Patient,
} from "@prisma/client";

// Re-export for convenience
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
  insurer: Insurer | null;
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
    userId: string | null;
    active: boolean;
  };
};

/**
 * Tipo para paciente completo con todas sus relaciones
 */
export type PatientWithFullRelations = Omit<Patient, "appointments"> & {
  insurer: (Insurer & { id: string; name: string }) | null;
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
export type PatientForInfoSheet = Pick<
  Patient,
  | "id"
  | "firstName"
  | "lastName"
  | "documentId"
  | "documentType"
  | "phone"
  | "email"
  | "birthDate"
  | "type"
  | "insurerId"
  | "treatingDoctorId"
  | "createdAt"
  | "updatedAt"
> & {
  insurer: { name: string } | null;
  treatingDoctor: {
    firstName: string;
    lastName: string;
    colorCode: string | null;
  } | null;
};
