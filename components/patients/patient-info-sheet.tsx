"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DOCUMENT_TYPES_MAP,
  DOCUMENT_TYPE_COLORS,
  patientTypeColors,
  patientTypeLabels,
} from "@/config/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  FileText,
  IdCard,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { EditPatientModal } from "./edit-patient-modal";
import { useState } from "react";
import type {
  PatientForInfoSheet,
  DoctorListItem,
  InsurerListItem,
} from "@/types/patient";

interface PatientInfoSheetProps {
  patient: PatientForInfoSheet;
  insurers: InsurerListItem[];
  doctors: DoctorListItem[];
}

export function PatientInfoSheet({
  patient,
  insurers,
  doctors,
}: PatientInfoSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <FileText className="h-4 w-4" />
          Ver Información
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto px-4">
        <SheetHeader>
          <SheetTitle>Información del Paciente</SheetTitle>
          <SheetDescription>
            Datos personales y afiliación clínica
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Datos Personales Card */}
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
                          className={`flex items-center justify-center leading-none font-mono text-[10px] px-2 py-0.5 cursor-help ${
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

          {/* Afiliación Clínica Card */}
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

        <SheetFooter>
          <EditPatientModal
            patient={patient}
            insurers={insurers}
            doctors={doctors}
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
