import { HeaderPage } from "@/components/header-page";
import { EditPatientModal } from "@/components/patients/edit-patient-modal";
import { PatientBreadcrumb } from "@/components/patients/patient-breadcrumb";
import { SectionAppointments } from "@/components/patients/section-appointments";
import { SectionAuthorizations } from "@/components/patients/section-authorizations";
import { SectionCards } from "@/components/patients/section-cards";
import { SectionInformation } from "@/components/patients/section-information";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import prisma from "@/lib/prisma";
import { getPatientById } from "@/lib/queries/patients";
import { Calendar1, File, FileUser, User } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientProfilePage({ params }: PageProps) {
  const { id } = await params;
  const { data, success } = await getPatientById(id);

  const [insurers, doctors] = await Promise.all([
    prisma.insurer.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.doctor.findMany({
      where: { active: true },
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
      {/* Configurar breadcrumbs personalizados */}
      <PatientBreadcrumb
        patientName={`${patient.firstName} ${patient.lastName}`}
        patientId={id}
      />

      <HeaderPage
        title={`${patient.firstName} ${patient.lastName}`}
        icon={User}
        actions={
          <EditPatientModal
            patient={patient}
            insurers={insurers}
            doctors={doctors}
          />
        }
      />

      <SectionCards
        isPrivate={isPrivate}
        activeAuth={activeAuth}
        sessionsLeft={sessionsLeft}
        totalAssisted={totalAssisted}
        totalPaid={totalPaid}
      />
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">
            <FileUser className="h-5 w-5 text-muted-foreground" />
            Información del paciente
          </TabsTrigger>
          {!isPrivate && (
            <TabsTrigger value="authorizations">
              <File className="h-5 w-5 text-muted-foreground" />
              Historial de autorizaciones
            </TabsTrigger>
          )}
          <TabsTrigger value="appointments">
            <Calendar1 className="h-5 w-5 text-muted-foreground" />
            Historial de sesiones
          </TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <SectionInformation
            patient={patient}
            insurers={insurers}
            doctors={doctors}
          />
        </TabsContent>
        <TabsContent value="authorizations">
          <SectionAuthorizations
            isPrivate={isPrivate}
            patient={patient}
            activeAuth={activeAuth}
          />
        </TabsContent>
        <TabsContent value="appointments">
          <SectionAppointments
            patient={patient}
            doctors={doctors}
            sessionsLeft={sessionsLeft}
            isPrivate={isPrivate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
