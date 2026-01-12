import { PrismaClient, UserRole, PatientType, AuthorizationStatus, } from "../lib/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Iniciando seeding v3 (Con Doctor Tratante)...')

  // 1. LIMPIEZA
  await prisma.payment.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.authorization.deleteMany()
  await prisma.tariff.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.insurer.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.user.deleteMany()

  // 2. DOCTOR
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@terapia.com',
      name: 'Dr. Juan Pérez',
      password: 'password123',
      role: UserRole.DOCTOR,
    }
  })

  const doctor = await prisma.doctor.create({
    data: {
      firstName: 'Juan',
      lastName: 'Pérez',
      userId: doctorUser.id,
      colorCode: '#2563eb',
      phone: '3001234567'
    }
  })

  // 3. ASEGURADORAS
  const sura = await prisma.insurer.create({
    data: { name: 'Seguros Sura (Híbrido)', nit: '800123456' }
  })

  const bolivar = await prisma.insurer.create({
    data: { name: 'Seguros Bolívar', nit: '900987654' }
  })

  // 4. TARIFAS
  // Sura EPS
  await prisma.tariff.create({
    data: {
      name: 'Sura EPS - Terapia Ocupacional',
      insurerId: sura.id,
      costTotal: 45000,
      copayAmount: 4500,  
      insurerAmount: 40500 
    }
  })

  // Sura Prepagada
  await prisma.tariff.create({
    data: {
      name: 'Sura Poliza Global - Paquete',
      insurerId: sura.id,
      costTotal: 65000,
      copayAmount: 0,     
      insurerAmount: 65000
    }
  })

  // Bolívar (Solo Paquete)
  await prisma.tariff.create({
    data: {
      name: 'Bolívar ARL',
      insurerId: bolivar.id,
      costTotal: 55000,
      copayAmount: 0,
      insurerAmount: 55000
    }
  })

  // Particular
  await prisma.tariff.create({
    data: {
      name: 'Particular 2026',
      insurerId: null,
      costTotal: 80000,
      copayAmount: 80000,
      insurerAmount: 0
    }
  })

  // 5. PACIENTES
  const patientsData = [
    { 
      name: 'Pepito', last: 'Copago', doc: '111', 
      type: PatientType.INSURANCE_COPAY, insurer: sura.id,
      auth: { total: 10, used: 2 } 
    },
    { 
      name: 'Anita', last: 'Paquete', doc: '222', 
      type: PatientType.INSURANCE_PACKAGE, insurer: sura.id,
      auth: { total: 20, used: 5 } 
    },
    { 
      name: 'Carlos', last: 'Plata', doc: '333', 
      type: PatientType.PRIVATE, insurer: null,
      auth: null
    },
    { 
      name: 'Rogelio', last: 'Arl', doc: '444', 
      type: PatientType.INSURANCE_PACKAGE, insurer: bolivar.id,
      auth: { total: 5, used: 0 }
    }
  ]

  for (const p of patientsData) {
    const patient = await prisma.patient.create({
      data: {
        firstName: p.name,
        lastName: p.last,
        documentId: p.doc,
        email: `${p.name.toLowerCase()}@demo.com`,
        phone: '3000000000',
        birthDate: new Date('1995-05-20'),
        type: p.type,
        insurerId: p.insurer,
        
        // ¡AQUÍ ESTÁ EL CAMBIO!
        // Asignamos al doctor creado arriba como el médico tratante
        treatingDoctorId: doctor.id 
      }
    })

    if (p.auth && p.insurer) {
      await prisma.authorization.create({
        data: {
          code: `AUT-${p.doc}-2026`,
          patientId: patient.id,
          insurerId: p.insurer,
          totalSessions: p.auth.total,
          usedSessions: p.auth.used,
          validFrom: new Date(),
          validUntil: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          status: AuthorizationStatus.ACTIVE
        }
      })
    }
  }

  console.log('✅ Seeding finalizado con relaciones Doctor-Paciente.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })