import { z } from "zod"
import { AppointmentType } from "@prisma/client"

export const appointmentSchema = z.object({
  patientId: z.string(),
  doctorId: z.string({ message: "Selecciona un doctor" }),
  date: z.date({ message: "Fecha requerida" }),
  time: z.string({ message: "Hora requerida" }),
  type: z.enum([AppointmentType.FIRST_TIME, AppointmentType.EVALUATION, AppointmentType.FOLLOW_UP], { 
    message: "Selecciona un tipo de cita" 
  }),
  description: z.string().optional(),
  duration: z.number().min(15).max(240),
  price: z.number().min(0, "El precio no puede ser negativo"),
  copayAmount: z.number().min(0).optional(),
}).refine((data) => {
  if (data.copayAmount && data.price) {
    return data.copayAmount <= data.price
  }
  return true
}, {
  message: "El copago no puede ser mayor al precio total",
  path: ["copayAmount"],
})

export type AppointmentFormValues = z.infer<typeof appointmentSchema>