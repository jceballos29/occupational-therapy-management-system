import { Doctor, Insurer, Patient } from "@/lib/generated/prisma/client"

export type PatientWithRelations = Patient & {
  insurer: Insurer | null
  treatingDoctor: Doctor | null
}