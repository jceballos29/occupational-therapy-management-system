import { z } from "zod"

export const authorizationSchema = z.object({
  patientId: z.string(),
  insurerId: z.string({ message: "Se requiere una aseguradora" }),
  
  code: z.string().min(3, "El código debe tener al menos 3 caracteres"),
  
  totalSessions: z.number()
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 sesión")
    .max(100, "Máximo 100 sesiones por paquete"),
    
  validFrom: z.date({ message: "Fecha de inicio requerida" }),
  validUntil: z.date({ message: "Fecha de vencimiento requerida" }),

  previousAuthAction: z.enum(['COMPLETED', 'EXPIRED']).optional(),
}).refine((data) => data.validUntil >= data.validFrom, {
  message: "La fecha de fin no puede ser anterior a la de inicio",
  path: ["validUntil"],
})

export type AuthorizationFormValues = z.infer<typeof authorizationSchema>