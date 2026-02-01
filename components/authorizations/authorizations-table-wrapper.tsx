"use client";

import { AuthorizationsDataTable } from "./data-table";
import { getAuthorizationColumns } from "./columns";
import { Authorization } from "@/lib/generated/prisma/browser";
import { AuthorizationFilters } from "./authorization-filters";
import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";

interface AuthorizationsTableWrapperProps {
  authorizations: Authorization[];
  insurerName: string;
}

// Hook que retorna filtros y tabla por separado
export function useAuthorizationsTable({
  authorizations,
  insurerName,
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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: sortedAuthorizations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return {
    filters: <AuthorizationFilters table={table} />,
    table: (
      <AuthorizationsDataTable columns={columns} data={sortedAuthorizations} />
    ),
  };
}

// Componente legacy para compatibilidad
export function AuthorizationsTableWrapper(
  props: AuthorizationsTableWrapperProps,
) {
  const { table } = useAuthorizationsTable(props);
  return table;
}
