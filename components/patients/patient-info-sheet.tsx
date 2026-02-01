"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Stethoscope
} from "lucide-react";
import { useState } from "react";
import { EditPatientModal } from "./edit-patient-modal";

interface PatientInfoSheetProps {
  patient: Patient & {
    insurer: Insurer | null;
    treatingDoctor: Doctor;
  };
  insurers: Insurer[];
  doctors: Doctor[];
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
          <FileUser className="h-4 w-4" />
          Ver Información
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <FileUser className="h-4 w-4 text-primary" />
            </div>
            Información del Paciente
          </SheetTitle>
          <SheetDescription>
            Aquí puedes ver la información del paciente y editarla si es necesario.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-4">
          <section className="space-y-2">
            <div className="flex items-center gap-2 border-b pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-200">
                <SquareUser className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-foreground">
                Datos Personales
              </h3>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">Nombre</p>
                <p className="text-muted-foreground">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium">Tipo de documento</p>
                <Badge
                  variant="outline"
                  className={`flex items-center justify-center leading-none px-2 py-0.5 ${
                    DOCUMENT_TYPE_COLORS[patient.documentType] || "bg-slate-100"
                  }`}
                >
                  {DOCUMENT_TYPES_MAP[patient.documentType]}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium">Número de documento</p>
                <p className="text-muted-foreground">{patient.documentId}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium">Fecha de nacimiento</p>
                <p className="text-muted-foreground">
                  {format(patient.birthDate, "PPP", { locale: es })}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium">Género</p>
                <p className="text-muted-foreground">
                  {genderLabels[patient.gender]}
                </p>
              </div>
            </div>
          </section>
          <section className="space-y-2">
            <div className="flex items-center gap-2 border-b pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-200">
                <Contact className="h-4 w-4 text-sky-600" />
              </div>
              <h3 className="font-semibold text-foreground">
                Datos de contacto
              </h3>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">Teléfono</p>
                <p className="text-muted-foreground">{patient.phone}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">
                  {patient.email || "Sin email"}
                </p>
              </div>
            </div>
          </section>
          <section className="space-y-2">
            <div className="flex items-center gap-2 border-b pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-200">
                <Stethoscope className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-foreground">Médico tratante</h3>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: patient.treatingDoctor.colorCode || "gray",
                }}
              />
              <span className="font-medium text-sm">
                Dr. {patient.treatingDoctor.firstName}{" "}
                {patient.treatingDoctor.lastName}
              </span>
              <span className="ml-auto text-sm text-muted-foreground">
                {patient.treatingDoctor.speciality}
              </span>
            </div>
          </section>
          <section className="space-y-2">
            <div className="flex items-center gap-2 border-b pb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">
                Afiliación Clínica
              </h3>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">Aseguradora</p>
                <p className="text-muted-foreground">
                  {patient.insurer?.name || "Sin Aseguradora"}
                </p>
              </div>
              {patient.insurer && !patient.insurer.isPrivate && (
                <div className="flex items-center justify-between">
                  <p className="font-medium">Afiliación</p>
                  <Badge
                    className={patientTypeColors[patient.type]}
                    variant="outline"
                  >
                    {patientTypeLabels[patient.type] || patient.type}
                  </Badge>
                </div>
              )}
            </div>
          </section>
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <EditPatientModal
            patient={patient}
            insurers={insurers}
            doctors={doctors}
          />
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full"
          >
            Cerrar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
