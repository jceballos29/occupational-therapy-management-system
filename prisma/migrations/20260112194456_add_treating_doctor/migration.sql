-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "treatingDoctorId" TEXT;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_treatingDoctorId_fkey" FOREIGN KEY ("treatingDoctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
