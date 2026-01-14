-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('FIRST_TIME', 'EVALUATION', 'FOLLOW_UP');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "type" "AppointmentType" NOT NULL DEFAULT 'FOLLOW_UP';
