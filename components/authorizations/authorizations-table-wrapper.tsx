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
}

// Hook que retorna filtros y tabla por separado
export function useAuthorizationsTable({
  authorizations,
}: AuthorizationsTableWrapperProps) {
  const columns = useMemo(() => getAuthorizationColumns(), []);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "validUntil", desc: false }, // Ordenar por fecha de vencimiento
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: authorizations,
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
      pagination: { pageSize: 5 },
    },
  });

  return {
    filters: <AuthorizationFilters table={table} />,
    table: <AuthorizationsDataTable columns={columns} data={authorizations} />,
  };
}

// Componente legacy para compatibilidad
export function AuthorizationsTableWrapper(
  props: AuthorizationsTableWrapperProps,
) {
  const { table } = useAuthorizationsTable(props);
  return table;
}
