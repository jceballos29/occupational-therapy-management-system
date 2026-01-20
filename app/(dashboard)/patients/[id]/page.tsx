import { AddAppointmentModal } from "@/components/appointments/add-appointment-modal";
import { AppointmentsTableWrapper } from "@/components/appointments/appointments-table-wrapper";
import { AddAuthorizationModal } from "@/components/authorizations/add-authorization-modal";
import { AuthorizationsTableWrapper } from "@/components/authorizations/authorizations-table-wrapper";
import { EditPatientModal } from "@/components/patients/edit-patient-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DOCUMENT_TYPE_COLORS,
  DOCUMENT_TYPES_MAP,
  patientTypeColors,
  patientTypeLabels,
} from "@/config/constants";
import prisma from "@/lib/prisma";
import { getPatientById } from "@/lib/queries/patients";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  CalendarPlus2,
  Edit,
  IdCard,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
};

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
    <div className="space-y-6 pb-8">
      {/* 1. Header de Navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <User className="h-6 w-6 text-slate-600" />
            {patient.firstName} {patient.lastName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/patients">
              <ArrowLeft className="h-4 w-4" />
              Volver a Pacientes
            </Link>
          </Button>
          {/* <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button> */}
          <EditPatientModal
            patient={patient}
            insurers={insurers}
            doctors={doctors}
          />
        </div>
      </div>

      {/* 2. Contenido Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA: Información Fija */}
        <div className="space-y-6">
          {/* Tarjeta de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Nombre</p>
                </div>
                <p className="text-muted-foreground">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IdCard className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Documento</p>
                </div>
                <div className="flex items-center gap-1">
                  <p className="text-muted-foreground">{patient.documentId}</p>
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className={` flex items-center justify-center leading-none font-mono text-[10px] px-2 py-0.5 cursor-help ${
                            DOCUMENT_TYPE_COLORS[patient.documentType] ||
                            "bg-slate-100"
                          }`}
                        >
                          {patient.documentType}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{DOCUMENT_TYPES_MAP[patient.documentType]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Teléfono</p>
                </div>
                <p className="text-muted-foreground">{patient.phone}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Email</p>
                </div>
                <p className="text-muted-foreground">
                  {patient.email || "Sin email"}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Nacimiento</p>
                </div>
                <p className="text-muted-foreground">
                  {format(patient.birthDate, "PPP", { locale: es })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta de Afiliación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Afiliación Clínica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Aseguradora</p>
                </div>
                <p className="text-muted-foreground">
                  {patient.insurer ? patient.insurer.name : "Sin Aseguradora"}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Afiliación</p>
                </div>
                <Badge
                  className={patientTypeColors[patient.type]}
                  variant="outline"
                >
                  {patientTypeLabels[patient.type] || patient.type}
                </Badge>
              </div>
              {patient.treatingDoctor && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          patient.treatingDoctor.colorCode || "gray",
                      }}
                    />
                    <p className="font-medium">Médico Tratante</p>
                  </div>
                  <p className="text-muted-foreground">
                    Dr. {patient.treatingDoctor.firstName}{" "}
                    {patient.treatingDoctor.lastName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: Área de Trabajo (Autorizaciones y Citas) */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={
                isPrivate ? "shadow-none bg-muted text-muted-foreground" : ""
              }
            >
              <CardHeader>
                <CardDescription className="font-medium">
                  Sesiones Disponibles
                </CardDescription>
                <CardTitle className="text-lg truncate">
                  {isPrivate ? "---" : sessionsLeft}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card
              className={
                isPrivate ? "shadow-none bg-muted text-muted-foreground" : ""
              }
            >
              <CardHeader>
                <CardDescription className="font-medium">
                  Autorización Activa
                </CardDescription>
                <CardTitle className="text-lg truncate">
                  {activeAuth ? activeAuth.code : "---"}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription className="font-medium">
                  Sesiones Asistidas
                </CardDescription>
                <CardTitle className="text-lg truncate">
                  {totalAssisted}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription className="font-medium">
                  Valor Total
                </CardDescription>
                <CardTitle className="text-lg truncate">{totalPaid}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Tabs
            defaultValue={isPrivate ? "history" : "authorizations"}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="authorizations" disabled={isPrivate}>
                Autorizaciones
              </TabsTrigger>
              <TabsTrigger value="history">Citas</TabsTrigger>
            </TabsList>
            <TabsContent value="authorizations" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Historial de Autorizaciones
                </h3>
                <AddAuthorizationModal
                  patientId={patient.id}
                  insurerId={patient.insurerId}
                  insurerName={patient.insurer?.name}
                  hasActiveAuth={!!activeAuth}
                />
              </div>
              {patient.authorizations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No hay autorizaciones registradas.
                </div>
              ) : (
                <AuthorizationsTableWrapper
                  authorizations={patient.authorizations}
                />
              )}
            </TabsContent>
            <TabsContent value="history" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Historial de Citas</h3>
                <AddAppointmentModal
                  patientId={patient.id}
                  patientType={patient.type}
                  doctors={doctors}
                />
              </div>
              <AppointmentsTableWrapper
                appointments={patient.appointments}
                doctors={doctors}
                patientType={patient.type}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
