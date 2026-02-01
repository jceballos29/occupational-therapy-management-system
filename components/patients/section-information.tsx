"use client";

import { useMounted } from "@/hooks/use-mounted";
import { EditPatientModal } from "./edit-patient-modal";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  DOCUMENT_TYPES_MAP,
  DOCUMENT_TYPE_COLORS,
  genderLabels,
  patientTypeColors,
  patientTypeLabels,
} from "@/config/constants";
import { Doctor, Insurer, Patient } from "@/lib/generated/prisma/browser";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Contact,
  FileUser,
  Shield,
  SquareUser,
  Stethoscope,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface SectionInformationProps {
  patient: Patient & {
    insurer: Insurer | null;
    treatingDoctor: Doctor;
  };
  insurers: Insurer[];
  doctors: Doctor[];
}

export function SectionInformation({
  patient,
  insurers,
  doctors,
}: SectionInformationProps) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <section className="space-y-4 pt-4">
        {/* TODO: Crear un Skeleton */}
      </section>
    );
  }

  return (
    <section className="space-y-4 pt-4">
      <Card className="shadow-none rounded-lg py-4 gap-0">
        <CardHeader className="px-4 pb-2">
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-200">
              <SquareUser className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-foreground">Datos Personales</h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1 grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="">
            <p className="font-medium text-muted-foreground">Nombres</p>
            <p>{patient.firstName}</p>
          </div>
          <div className="">
            <p className="font-medium text-muted-foreground">Apellidos</p>
            <p>{patient.lastName}</p>
          </div>
          <div className="">
            <p className="font-medium text-muted-foreground">
              Tipo de documento
            </p>
            <Badge
              variant="outline"
              className={cn(
                DOCUMENT_TYPE_COLORS[patient.documentType],
                "font-mono",
              )}
            >
              {DOCUMENT_TYPES_MAP[patient.documentType]}
            </Badge>
          </div>
          <div className="">
            <p className="font-medium text-muted-foreground">
              Número de documento
            </p>
            <p>{patient.documentId}</p>
          </div>
          <div className="">
            <p className="font-medium text-muted-foreground">Género</p>
            <p>{genderLabels[patient.gender]}</p>
          </div>
          <div className="">
            <p className="font-medium text-muted-foreground">
              Fecha de nacimiento
            </p>
            <p className="">
              {format(patient.birthDate, "PPP", { locale: es })}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-none rounded-lg py-4 gap-0">
        <CardHeader className="px-4 pb-2">
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-200">
              <Contact className="h-4 w-4 text-sky-600" />
            </div>
            <h3 className="font-semibold text-foreground">Datos de contacto</h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="">
            <p className="font-medium text-muted-foreground">Teléfono</p>
            <p>{patient.phone}</p>
          </div>
          <div className="">
            <p className="font-medium text-muted-foreground">Email</p>
            <p>{patient.email || "Sin email"}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-none rounded-lg py-4 gap-0">
        <CardHeader className="px-4 pb-2">
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              Datos administrativos
            </h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="">
            <p className="font-medium text-muted-foreground">Médico tratante</p>
            <p className="flex items-center gap-1">
              <span
                className="w-4 h-4 rounded-full inline-block"
                style={{
                  backgroundColor: patient.treatingDoctor.colorCode || "gray",
                }}
              />
              <span>
                Dr. {patient.treatingDoctor.firstName}{" "}
                {patient.treatingDoctor.lastName}
              </span>
            </p>
          </div>
          <div className="">
            <p className="font-medium text-muted-foreground">Aseguradora</p>
            <p>{patient.insurer?.name || "Sin aseguradora"}</p>
          </div>
          <div className="">
            <p className="font-medium text-muted-foreground">
              Tipo de convenio
            </p>
            <Badge
              className={cn(patientTypeColors[patient.type], "font-mono")}
              variant="outline"
            >
              {patientTypeLabels[patient.type] || patient.type}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
