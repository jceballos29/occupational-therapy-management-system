"use client";

import { ColumnDef, SortingState } from "@tanstack/react-table";

import { DataTable as GenericDataTable } from "@/components/data-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters?: React.ReactNode;
}

export function AuthorizationsDataTable<TData, TValue>({
  columns,
  data,
  filters,
}: DataTableProps<TData, TValue>) {
  const defaultSort: SortingState = [
    { id: "validUntil", desc: false }, // Ordenar por fecha de vencimiento por defecto
  ];

  return (
    <GenericDataTable
      columns={columns}
      data={data}
      filters={filters}
      defaultSort={defaultSort}
    />
  );
}
