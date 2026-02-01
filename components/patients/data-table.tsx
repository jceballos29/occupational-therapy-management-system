"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable as GenericDataTable } from "@/components/data-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  return <GenericDataTable columns={columns} data={data} />;
}
