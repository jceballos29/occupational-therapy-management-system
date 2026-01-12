-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DOCTOR', 'ASSISTANT', 'SECRETARY');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'CARD', 'INSURANCE_DEPOSIT');

-- CreateEnum
CREATE TYPE "PatientType" AS ENUM ('PRIVATE', 'INSURANCE_COPAY', 'INSURANCE_PACKAGE');

-- CreateEnum
CREATE TYPE "AuthorizationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SECRETARY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "colorCode" TEXT DEFAULT '#3b82f6',
    "phone" TEXT,
    "userId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insurer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nit" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Insurer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "type" "PatientType" NOT NULL DEFAULT 'PRIVATE',
    "insurerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tariff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "insurerId" TEXT,
    "costTotal" DECIMAL(10,2) NOT NULL,
    "copayAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "insurerAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Tariff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authorization" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "insurerId" TEXT NOT NULL,
    "totalSessions" INTEGER NOT NULL,
    "usedSessions" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" "AuthorizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Authorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "authorizationId" TEXT,
    "priceTotal" DECIMAL(10,2),
    "priceCopay" DECIMAL(10,2),
    "priceInsurer" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payer" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Insurer_name_key" ON "Insurer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_documentId_key" ON "Patient"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "Authorization_code_insurerId_key" ON "Authorization"("code", "insurerId");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tariff" ADD CONSTRAINT "Tariff_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authorization" ADD CONSTRAINT "Authorization_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authorization" ADD CONSTRAINT "Authorization_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_authorizationId_fkey" FOREIGN KEY ("authorizationId") REFERENCES "Authorization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
