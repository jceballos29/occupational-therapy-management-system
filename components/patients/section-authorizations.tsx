"use client";

import { Authorization } from "@/lib/generated/prisma/browser";
import { PatientWithFullRelations } from "@/types/patient";
import { AddAuthorizationModal } from "../authorizations/add-authorization-modal";
import { useAuthorizationsTable } from "../authorizations/authorizations-table-wrapper";
import { File } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import { TableSkeleton } from "@/components/table-skeleton";

export interface SectionAuthorizationsProps {
  isPrivate: boolean;
  patient: PatientWithFullRelations;
  activeAuth?: Authorization;
}

export function SectionAuthorizations({
  isPrivate,
  patient,
  activeAuth,
}: SectionAuthorizationsProps) {
  const mounted = useMounted();

  const { filters, table } = useAuthorizationsTable({
    authorizations: patient.authorizations,
    insurerName: patient.insurer?.name || "",
  });

  if (isPrivate) {
    return null;
  }

  // Evitar errores de hidratación
  if (!mounted) {
    return (
      <div className="space-y-4 pt-4">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Filtros y Botón de Nueva Autorización al mismo nivel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filtros a la izquierda */}
        {filters}

        {/* Botón a la derecha */}
        <AddAuthorizationModal
          patientId={patient.id}
          insurerId={patient.insurerId}
          insurerName={patient.insurer?.name}
          hasActiveAuth={!!activeAuth}
        />
      </div>

      {/* Tabla de autorizaciones */}
      {table}
    </div>
  );
}
