import { HeaderPage } from "@/components/header-page";
import { EditPatientModal } from "@/components/patients/edit-patient-modal";
import { PatientInfoSheet } from "@/components/patients/patient-info-sheet";
import { SectionAppointments } from "@/components/patients/section-appointments";
import { SectionAuthorizations } from "@/components/patients/section-authorizations";
import { SectionCards } from "@/components/patients/section-cards";
import { Separator } from "@/components/ui/separator";
import prisma from "@/lib/prisma";
import { getPatientById } from "@/lib/queries/patients";
import { User } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientProfilePage({ params }: PageProps) {
  // En Next.js 15+ params es una promesa, hay que esperarla
  const { id } = await params;
  const { data, success } = await getPatientById(id);

  const [insurers, doctors] = await Promise.all([
    prisma.insurer.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.doctor.findMany({
      where: { active: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
  ]);

  if (!success || !data?.patient) {
    notFound();
  }

  const { patient, stats } = data;

  // Lógica de Negocio
  const isPrivate = patient.type === "PRIVATE";
  const activeAuth = patient.authorizations.find((a) => a.status === "ACTIVE");
  const sessionsLeft = activeAuth
    ? activeAuth.totalSessions - activeAuth.usedSessions
    : 0;

  // Totales
  const totalAssisted = stats?._count.id || 0;
  const totalPaid = Number(stats?._sum.priceTotal || 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      <HeaderPage
        title={`${patient.firstName} ${patient.lastName}`}
        icon={User}
        backUrl="/patients"
        backLabel="Volver a Pacientes"
        actions={
          <>
            <PatientInfoSheet
              patient={patient}
              insurers={insurers}
              doctors={doctors}
            />
          </>
        }
      />
      
      <SectionCards
        isPrivate={isPrivate}
        activeAuth={activeAuth}
        sessionsLeft={sessionsLeft}
        totalAssisted={totalAssisted}
        totalPaid={totalPaid}
      />
      <Separator />
      <SectionAuthorizations
        isPrivate={isPrivate}
        patient={patient}
        activeAuth={activeAuth}
      />
      <Separator />
      <SectionAppointments patient={patient} doctors={doctors} />
    </div>
  );
}
