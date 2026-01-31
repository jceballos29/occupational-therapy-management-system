"use client";

import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { useEffect } from "react";

interface PatientBreadcrumbProps {
  patientName: string;
  patientId: string;
}

export function PatientBreadcrumb({
  patientName,
  patientId,
}: PatientBreadcrumbProps) {
  const { setCustomBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setCustomBreadcrumbs([
      { label: "Pacientes", href: "/patients" },
      { label: patientName, href: `/patients/${patientId}` },
    ]);

    // Limpiar al desmontar
    return () => setCustomBreadcrumbs([]);
  }, [patientName, patientId, setCustomBreadcrumbs]);

  // Este componente no renderiza nada, solo configura los breadcrumbs
  return null;
}
