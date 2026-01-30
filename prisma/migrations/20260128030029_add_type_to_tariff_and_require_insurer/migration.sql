/*
  Warnings:

  - Made the column `insurerId` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `type` to the `Tariff` table without a default value. This is not possible if the table is not empty.
  - Made the column `insurerId` on table `Tariff` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_insurerId_fkey";

-- DropForeignKey
ALTER TABLE "Tariff" DROP CONSTRAINT "Tariff_insurerId_fkey";

-- AlterTable
ALTER TABLE "Patient" ALTER COLUMN "insurerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tariff" ADD COLUMN     "type" "PatientType" NOT NULL,
ALTER COLUMN "insurerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tariff" ADD CONSTRAINT "Tariff_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
