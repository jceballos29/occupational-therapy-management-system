"use client";

import { DataTable } from "@/components/data-table";
import { getAuthorizationColumns } from "./columns";
import { Authorization } from "@/lib/generated/prisma/browser";
import { AuthorizationFilters } from "./authorization-filters";
import { useMemo } from "react";
import { SortingState } from "@tanstack/react-table";

interface AuthorizationsTableWrapperProps {
  authorizations: Authorization[];
  insurerName: string;
  actions?: React.ReactNode;
}

export function AuthorizationsTableWrapper({
  authorizations,
  insurerName,
  actions,
}: AuthorizationsTableWrapperProps) {
  // Ordenar autorizaciones: ACTIVAS primero, luego por validFrom desc
  const sortedAuthorizations = useMemo(() => {
    return [...authorizations].sort((a, b) => {
      // Primero: ACTIVE > otros estados
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
      if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;

      // Segundo: fecha de inicio más reciente
      return new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime();
    });
  }, [authorizations]);

  const columns = useMemo(
    () => getAuthorizationColumns(insurerName),
    [insurerName],
  );

  // Ordenar por fecha de vencimiento por defecto
  const defaultSort: SortingState = [{ id: "validUntil", desc: false }];

  return (
    <DataTable
      columns={columns}
      data={sortedAuthorizations}
      filters={(table) => <AuthorizationFilters table={table} />}
      actions={actions}
      defaultSort={defaultSort}
    />
  );
}

// Hook para uso externo - retorna tabla con filtros y actions integrados
export function useAuthorizationsTable({
  authorizations,
  insurerName,
  actions,
}: AuthorizationsTableWrapperProps) {
  // Ordenar autorizaciones: ACTIVAS primero, luego por validFrom desc
  const sortedAuthorizations = useMemo(() => {
    return [...authorizations].sort((a, b) => {
      if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
      if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
      return new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime();
    });
  }, [authorizations]);

  const columns = useMemo(
    () => getAuthorizationColumns(insurerName),
    [insurerName],
  );

  const defaultSort: SortingState = [{ id: "validUntil", desc: false }];

  return {
    table: (
      <DataTable
        columns={columns}
        data={sortedAuthorizations}
        filters={(table) => <AuthorizationFilters table={table} />}
        actions={actions}
        defaultSort={defaultSort}
      />
    ),
  };
}
