/*
  Warnings:

  - Made the column `treatingDoctorId` on table `Patient` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_treatingDoctorId_fkey";

-- AlterTable
ALTER TABLE "Patient" ALTER COLUMN "treatingDoctorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_treatingDoctorId_fkey" FOREIGN KEY ("treatingDoctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
