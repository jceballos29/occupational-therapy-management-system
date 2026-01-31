import {
  AppointmentStatus,
  AppointmentType,
  AuthorizationStatus,
  DocumentType,
  Gender,
  PatientType,
  PrismaClient,
  UserRole,
} from "@/lib/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import "dotenv/config";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

async function main() {
  console.log("🌱 Iniciando seeding v5 (Con Gender y Speciality)...");

  // 1. LIMPIEZA
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.authorization.deleteMany();
  await prisma.tariff.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.insurer.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();

  // 2. DOCTORES
  const doctorsData = [
    {
      email: "doctor@terapia.com",
      name: "Dr. Juan Pérez",
      firstName: "Juan",
      lastName: "Pérez",
      speciality: "Terapia Ocupacional Pediátrica",
      colorCode: "#2563eb",
      phone: "3001234567",
    },
    {
      email: "maria.rodriguez@terapia.com",
      name: "Dra. María Rodríguez",
      firstName: "María",
      lastName: "Rodríguez",
      speciality: "Terapia Ocupacional Geriátrica",
      colorCode: "#dc2626",
      phone: "3009876543",
    },
    {
      email: "carlos.sanchez@terapia.com",
      name: "Dr. Carlos Sánchez",
      firstName: "Carlos",
      lastName: "Sánchez",
      speciality: "Rehabilitación Neurológica",
      colorCode: "#16a34a",
      phone: "3005551234",
    },
    {
      email: "ana.garcia@terapia.com",
      name: "Dra. Ana García",
      firstName: "Ana",
      lastName: "García",
      speciality: "Terapia de Mano y Miembro Superior",
      colorCode: "#9333ea",
      phone: "3007778888",
    },
  ];

  const doctors = [];
  for (const docData of doctorsData) {
    const user = await prisma.user.create({
      data: {
        email: docData.email,
        name: docData.name,
        password: "password123",
        role: UserRole.DOCTOR,
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        firstName: docData.firstName,
        lastName: docData.lastName,
        speciality: docData.speciality,
        userId: user.id,
        colorCode: docData.colorCode,
        phone: docData.phone,
      },
    });

    doctors.push(doctor);
  }

  console.log(`✅ ${doctors.length} doctores creados`);

  // 3. ASEGURADORAS

  // ✅ NUEVA: Aseguradora "Particular" para pacientes privados
  const particular = await prisma.insurer.create({
    data: {
      name: "Particular",
      nit: null,
      active: true,
      isPrivate: true,
    },
  });

  const sura = await prisma.insurer.create({
    data: { name: "Seguros Sura", nit: "800123456" },
  });

  const bolivar = await prisma.insurer.create({
    data: { name: "Seguros Bolívar", nit: "900987654" },
  });

  const sanitas = await prisma.insurer.create({
    data: { name: "EPS Sanitas", nit: "800251440" },
  });

  // 4. TARIFAS CON TIPOS

  // --- TARIFAS PARTICULARES ---
  await prisma.tariff.create({
    data: {
      name: "Sesión Particular 2026",
      insurerId: particular.id,
      type: PatientType.PRIVATE,
      costTotal: 120000,
      copayAmount: 120000, // El paciente paga todo
      insurerAmount: 0,
      active: true,
    },
  });

  // Tarifa histórica (inactiva) - Ejemplo de historial
  await prisma.tariff.create({
    data: {
      name: "Sesión Particular 2025",
      insurerId: particular.id,
      type: PatientType.PRIVATE,
      costTotal: 100000,
      copayAmount: 100000,
      insurerAmount: 0,
      active: false, // Inactiva - solo para historial
    },
  });

  // --- TARIFAS SURA ---

  // Sura con Copago
  await prisma.tariff.create({
    data: {
      name: "Sura EPS - Copago",
      insurerId: sura.id,
      type: PatientType.INSURANCE_COPAY,
      costTotal: 80000,
      copayAmount: 20000,
      insurerAmount: 60000,
      active: true,
    },
  });

  // Sura Paquete
  await prisma.tariff.create({
    data: {
      name: "Sura Póliza - Paquete",
      insurerId: sura.id,
      type: PatientType.INSURANCE_PACKAGE,
      costTotal: 100000,
      copayAmount: 0,
      insurerAmount: 100000,
      active: true,
    },
  });

  // --- TARIFAS BOLÍVAR ---

  // Bolívar (Solo Paquete)
  await prisma.tariff.create({
    data: {
      name: "Bolívar ARL - Paquete",
      insurerId: bolivar.id,
      type: PatientType.INSURANCE_PACKAGE,
      costTotal: 95000,
      copayAmount: 0,
      insurerAmount: 95000,
      active: true,
    },
  });

  // --- TARIFAS SANITAS ---

  // Sanitas con Copago
  await prisma.tariff.create({
    data: {
      name: "Sanitas EPS - Copago",
      insurerId: sanitas.id,
      type: PatientType.INSURANCE_COPAY,
      costTotal: 75000,
      copayAmount: 15000,
      insurerAmount: 60000,
      active: true,
    },
  });

  // 5. PACIENTES
  const patientsData = [
    {
      name: "María",
      last: "Particular",
      doc: "123456789",
      docType: DocumentType.CC,
      gender: Gender.FEMALE,
      type: PatientType.PRIVATE,
      insurer: particular.id,
      auth: null,
    },
    {
      name: "Pepito",
      last: "López",
      doc: "111222333",
      docType: DocumentType.TI,
      gender: Gender.MALE,
      type: PatientType.INSURANCE_COPAY,
      insurer: sura.id,
      auth: { total: 10, used: 2 },
    },
    {
      name: "Anita",
      last: "Gómez",
      doc: "555666777",
      docType: DocumentType.CC,
      gender: Gender.FEMALE,
      type: PatientType.INSURANCE_PACKAGE,
      insurer: sura.id,
      auth: { total: 20, used: 5 },
    },
    {
      name: "Carlos",
      last: "Extranjero",
      doc: "E-555999",
      docType: DocumentType.CE,
      gender: Gender.MALE,
      type: PatientType.PRIVATE,
      insurer: particular.id,
      auth: null,
    },
    {
      name: "Rogelio",
      last: "Martínez",
      doc: "999888777",
      docType: DocumentType.PT,
      gender: Gender.MALE,
      type: PatientType.INSURANCE_PACKAGE,
      insurer: bolivar.id,
      auth: { total: 5, used: 0 },
    },
    {
      name: "Laura",
      last: "Sánchez",
      doc: "444555666",
      docType: DocumentType.CC,
      gender: Gender.FEMALE,
      type: PatientType.INSURANCE_COPAY,
      insurer: sanitas.id,
      auth: { total: 8, used: 3 },
    },
  ];

  for (let i = 0; i < patientsData.length; i++) {
    const p = patientsData[i];
    const assignedDoctor = doctors[i % doctors.length];

    const patient = await prisma.patient.create({
      data: {
        firstName: p.name,
        lastName: p.last,
        documentId: p.doc,
        documentType: p.docType,
        gender: p.gender,
        email: `${p.name.toLowerCase()}@demo.com`,
        phone: "3000000000",
        birthDate: new Date("1995-05-20"),
        type: p.type,
        insurerId: p.insurer,
        treatingDoctorId: assignedDoctor.id,
      },
    });

    // Obtener la tarifa correspondiente al tipo de paciente y aseguradora
    const patientTariff = await prisma.tariff.findFirst({
      where: {
        insurerId: p.insurer,
        type: p.type,
        active: true,
      },
    });

    let authorization = null;
    if (p.auth && p.insurer) {
      authorization = await prisma.authorization.create({
        data: {
          code: `AUT-${p.doc.slice(0, 5)}-2026`,
          patientId: patient.id,
          insurerId: p.insurer,
          totalSessions: p.auth.total,
          usedSessions: p.auth.used,
          validFrom: new Date(),
          validUntil: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          status: AuthorizationStatus.ACTIVE,
        },
      });

      // Crear citas COMPLETED que coincidan con usedSessions
      for (let j = 0; j < p.auth.used; j++) {
        const daysAgo = (p.auth.used - j) * 7; // Una cita por semana
        const appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() - daysAgo);
        appointmentDate.setHours(9 + j, 0, 0, 0); // Horario de 9am en adelante

        await prisma.appointment.create({
          data: {
            patientId: patient.id,
            doctorId: assignedDoctor.id,
            authorizationId: authorization.id,
            startTime: appointmentDate,
            endTime: new Date(appointmentDate.getTime() + 45 * 60000), // 45 minutos
            type:
              j === 0 ? AppointmentType.FIRST_TIME : AppointmentType.FOLLOW_UP,
            status: AppointmentStatus.COMPLETED,
            priceTotal: patientTariff?.costTotal || 0,
            priceCopay: patientTariff?.copayAmount || 0,
            priceInsurer: patientTariff?.insurerAmount || 0,
            notes: `Sesión ${j + 1} de ${p.auth.total} - Completada`,
          },
        });
      }
    } else if (p.type === PatientType.PRIVATE && patientTariff) {
      // Para pacientes particulares, crear algunas citas de ejemplo
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() - 7);
      appointmentDate.setHours(10, 0, 0, 0);

      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: assignedDoctor.id,
          authorizationId: null, // Particulares no tienen autorización
          startTime: appointmentDate,
          endTime: new Date(appointmentDate.getTime() + 45 * 60000),
          type: AppointmentType.FIRST_TIME,
          status: AppointmentStatus.COMPLETED,
          priceTotal: patientTariff.costTotal,
          priceCopay: patientTariff.copayAmount,
          priceInsurer: patientTariff.insurerAmount,
          notes: "Primera sesión particular - Completada",
        },
      });
    }
  }

  console.log("✅ Seeding v4 finalizado:");
  console.log("   - Aseguradoras: Particular, Sura, Bolívar, Sanitas");
  console.log("   - Tarifas con TIPOS (PRIVATE, COPAY, PACKAGE)");
  console.log("   - 6 pacientes con insurerId obligatorio");
  console.log("   - Autorizaciones con sesiones usadas");
  console.log("   - Citas COMPLETED consistentes con usedSessions");
  console.log("   - Historial de tarifas (inactivas)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
