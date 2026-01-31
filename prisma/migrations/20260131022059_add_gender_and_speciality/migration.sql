/*
  Warnings:

  - Added the required column `speciality` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "speciality" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "gender" "Gender" NOT NULL;
