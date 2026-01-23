import { Authorization } from "@prisma/client";
import { PatientWithFullRelations } from "@/types/patient";
import { AddAuthorizationModal } from "../authorizations/add-authorization-modal";
import { AuthorizationsTableWrapper } from "../authorizations";
import { File } from "lucide-react";

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
  if (isPrivate) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="scroll-m-20 text-lg font-semibold tracking-tight flex items-center gap-2">
          <File className="h-5 w-5 text-muted-foreground" />
          Historial de Autorizaciones
        </h3>
        <AddAuthorizationModal
          patientId={patient.id}
          insurerId={patient.insurerId}
          insurerName={patient.insurer?.name}
          hasActiveAuth={!!activeAuth}
        />
      </div>
      <AuthorizationsTableWrapper authorizations={patient.authorizations} />
    </div>
  );
}
