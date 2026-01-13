-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CC', 'CE', 'CD', 'PA', 'SC', 'PE', 'PT', 'RC', 'TI', 'CN', 'AS', 'MS', 'DE');

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "documentType" "DocumentType" NOT NULL DEFAULT 'CC';
