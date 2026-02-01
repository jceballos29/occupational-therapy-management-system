import { z } from "zod";
import { DocumentType, Gender, PatientType } from "../generated/prisma/enums";

export const patientFormSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),

  documentType: z.enum(
    [
      DocumentType.CC,
      DocumentType.CE,
      DocumentType.CD,
      DocumentType.PA,
      DocumentType.SC,
      DocumentType.PE,
      DocumentType.PT,
      DocumentType.RC,
      DocumentType.TI,
      DocumentType.CN,
      DocumentType.AS,
      DocumentType.MS,
      DocumentType.DE,
    ],
    {
      message: "Selecciona un tipo de documento",
    },
  ),
  documentId: z.string().min(3, "El número de documento es requerido"),

  email: z.email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(7, "Teléfono requerido"),

  birthDate: z.date({
    message: "La fecha de nacimiento es requerida",
  }),

  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER], {
    message: "Selecciona un género",
  }),

  type: z.enum(
    [
      PatientType.PRIVATE,
      PatientType.INSURANCE_COPAY,
      PatientType.INSURANCE_PACKAGE,
    ],
    {
      message: "Selecciona un tipo de afiliación",
    },
  ),

  // Relaciones - insurerId ahora es obligatorio
  insurerId: z.string({ message: "La aseguradora es requerida" }),
  treatingDoctorId: z.string({ message: "El médico tratante es requerido" }),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
