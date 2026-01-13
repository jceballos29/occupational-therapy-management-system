import { getPatientById } from "@/lib/queries/patients"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, CreditCard, Edit, FileText, Phone, User, ShieldCheck, UserIcon, IdCard, Mail, Shield } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DOCUMENT_TYPE_COLORS, DOCUMENT_TYPES_MAP, patientTypeColors, patientTypeLabels } from "@/config/constants"
import { DocumentType } from "@/lib/generated/prisma/enums"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"


interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PatientProfilePage({ params }: PageProps) {
  // En Next.js 15+ params es una promesa, hay que esperarla
  const { id } = await params
  const { data: patient, success } = await getPatientById(id)

  if (!success || !patient) {
    notFound()
  }

  // Cálculos rápidos para el UI
  const activeAuth = patient.authorizations.find(a => a.status === 'ACTIVE')
  const sessionsLeft = activeAuth ? activeAuth.totalSessions - activeAuth.usedSessions : 0

  return (
    <div className="space-y-6">
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
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
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
                          className={` flex items-center justify-center leading-none font-mono text-[10px] px-2 py-0.5 cursor-help ${DOCUMENT_TYPE_COLORS[patient.documentType] || "bg-slate-100"}`}
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
                <p className="text-muted-foreground">
                  {patient.phone}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Email</p>
                </div>
                <p className="text-muted-foreground">
                  {patient.email || 'Sin email'}
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
                  {patient.insurer ? patient.insurer.name : 'Sin Aseguradora'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Afiliación</p>
                </div>
                <Badge className={patientTypeColors[patient.type]} variant="outline">
                  {patientTypeLabels[patient.type] || patient.type}
                </Badge>
              </div>
              {
                patient.treatingDoctor && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: patient.treatingDoctor.colorCode || 'gray' }}
                      />
                      <p className="font-medium">Médico Tratante</p>
                    </div>
                    <p className="text-muted-foreground">
                      Dr. {patient.treatingDoctor.firstName} {patient.treatingDoctor.lastName}
                    </p>
                  </div>
                )
              }
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: Área de Trabajo (Autorizaciones y Citas) */}
        <div className="md:col-span-2">
          <Tabs defaultValue="authorizations" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="authorizations">Autorizaciones / Paquetes</TabsTrigger>
              <TabsTrigger value="history">Historial de Citas</TabsTrigger>
            </TabsList>

            {/* TAB: AUTORIZACIONES */}
            <TabsContent value="authorizations" className="space-y-4 mt-4">
              {/* Tarjeta de Resumen de Saldo */}
              {patient.type !== 'PRIVATE' && (
                <div className="grid grid-cols-2 gap-4">
                  <Card >
                    <CardHeader className="pb-2">
                      <CardDescription >Sesiones Disponibles</CardDescription>
                      <CardTitle className="text-3xl">{sessionsLeft}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Autorización Activa</CardDescription>
                      <CardTitle className="text-lg truncate">
                        {activeAuth ? activeAuth.code : "Ninguna"}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              )}

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Historial de Autorizaciones</h3>
                <Button size="sm">
                  <CreditCard className="mr-2 h-4 w-4" /> Nueva Autorización
                </Button>
              </div>

              {/* Lista de Autorizaciones */}
              <Card>
                <CardContent className="p-0">
                  {patient.authorizations.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                      No hay autorizaciones registradas.
                    </div>
                  ) : (
                    <div className="divide-y">
                      {patient.authorizations.map((auth) => (
                        <div key={auth.id} className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">Cód: {auth.code}</p>
                            <p className="text-xs text-muted-foreground">
                              Vence: {format(auth.validUntil, "dd/MM/yyyy")}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {auth.usedSessions} / {auth.totalSessions}
                              </span>
                              <Badge variant={auth.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {auth.status}
                              </Badge>
                            </div>
                            {/* Barra de progreso visual simple */}
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full ml-auto overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{ width: `${(auth.usedSessions / auth.totalSessions) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: HISTORIAL */}
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Sesiones</CardTitle>
                  <CardDescription>Mostrando las últimas 5 citas registradas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 text-center text-muted-foreground text-sm border-dashed border-2 rounded-lg">
                    Aquí se listarán las citas cuando integremos el módulo de Agenda.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}