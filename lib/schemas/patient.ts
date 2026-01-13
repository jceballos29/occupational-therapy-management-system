import { z } from "zod"
import { DocumentType, PatientType } from "../generated/prisma/enums"


export const patientFormSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  
  documentType: z.enum(DocumentType, {
    error: "Selecciona un tipo de documento" 
  }),
  documentId: z.string().min(3, "El número de documento es requerido"),
  
  email: z.email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(7, "Teléfono requerido"),
  
  birthDate: z.date({
    error: "La fecha de nacimiento es requerida",
  }),
  
  type: z.enum(PatientType, {
    error: "Selecciona un tipo de afiliación",
  }),
  
  // Relaciones
  insurerId: z.string().optional(),
  treatingDoctorId: z.string().optional(),
}).refine((data) => {
  // REGLA DE NEGOCIO: Si NO es particular, debe tener Aseguradora seleccionada
  if (data.type !== "PRIVATE" && !data.insurerId) {
    return false
  }
  return true
}, {
  message: "La aseguradora es obligatoria para este tipo de afiliación",
  path: ["insurerId"],
})

export type PatientFormValues = z.infer<typeof patientFormSchema>