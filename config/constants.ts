import { AppointmentStatus, AppointmentType, DocumentType, Gender } from "@/lib/generated/prisma/enums"

export const DOCUMENT_TYPES_MAP: Record<DocumentType, string> = {
  CC: "Cédula de Ciudadanía",
  CE: "Cédula de Extranjería",
  CD: "Carné Diplomático",
  PA: "Pasaporte",
  SC: "Salvoconducto",
  PE: "Permiso Especial de Permanencia",
  PT: "Permiso por Protección Temporal",
  RC: "Registro Civil",
  TI: "Tarjeta de Identidad",
  CN: "Certificado de Nacido Vivo",
  AS: "Adulto Sin Identificación",
  MS: "Menor Sin Identificación",
  DE: "Documento Extranjero",
}

// Colores sugeridos para los badges según el tipo
export const DOCUMENT_TYPE_COLORS: Record<DocumentType, string> = {
  // Nacionales (Azules/Grises)
  CC: "bg-slate-100 text-slate-800 border-slate-200",
  TI: "bg-blue-50 text-blue-700 border-blue-200",
  RC: "bg-blue-50 text-blue-700 border-blue-200",
  CN: "bg-blue-50 text-blue-700 border-blue-200",
  
  // Extranjería (Morados/Naranjas)
  CE: "bg-purple-100 text-purple-800 border-purple-200",
  PA: "bg-orange-100 text-orange-800 border-orange-200",
  CD: "bg-indigo-100 text-indigo-800 border-indigo-200",
  DE: "bg-orange-50 text-orange-800 border-orange-200",
  
  // Migración / Permisos (Ámbar/Amarillo)
  PT: "bg-amber-100 text-amber-800 border-amber-200",
  PE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  SC: "bg-yellow-50 text-yellow-700 border-yellow-200",

  // Sin Identificación (Rojo/Alerta)
  AS: "bg-red-100 text-red-800 border-red-200",
  MS: "bg-red-100 text-red-800 border-red-200",
}

// Diccionario para traducir los tipos de paciente a Español
export const patientTypeLabels: Record<string, string> = {
  PRIVATE: "Particular",
  INSURANCE_COPAY: "Copago",
  INSURANCE_PACKAGE: "Paquete"
}

// Diccionario para colores de los Badges
export const patientTypeColors: Record<string, string> = {
  PRIVATE: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  INSURANCE_COPAY: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  INSURANCE_PACKAGE: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100"
}

export const APPOINTMENT_TYPES_MAP: Record<AppointmentType, string> = {
  FIRST_TIME: "Primera Vez",
  EVALUATION: "Evaluación",
  FOLLOW_UP: "Seguimiento",
}

export const appointmentTypeColors: Record<AppointmentType, string> = {
  FIRST_TIME: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  EVALUATION: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  FOLLOW_UP: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100"
}

// Mapeo de colores basado EXACTAMENTE en tu Schema
export const statusStyles: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200", // Antes era CONFIRMED
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  NO_SHOW: "bg-slate-100 text-slate-800 border-slate-200", // No asistió
}

// Diccionario para traducir los estados a español visualmente
export const statusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Asistida",
  CANCELLED: "Cancelada",
  NO_SHOW: "No Asistió"
}

export const genderLabels: Record<Gender, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
  OTHER: "Otro"
}