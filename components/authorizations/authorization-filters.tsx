"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface AuthorizationFiltersProps<TData> {
  table: Table<TData>;
}

export function AuthorizationFilters<TData>({
  table,
}: AuthorizationFiltersProps<TData>) {
  const columnFilters = table.getState().columnFilters;

  return (
    <div className="flex items-center gap-2">
      {/* Filtro por Estado */}
      <Select
        value={(table.getColumn("status")?.getFilterValue() as string) ?? "ALL"}
        onValueChange={(value) => {
          if (value === "ALL") table.getColumn("status")?.setFilterValue("");
          else table.getColumn("status")?.setFilterValue(value);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos los estados</SelectItem>
          <SelectItem value="ACTIVE">Activa</SelectItem>
          <SelectItem value="COMPLETED">Completada</SelectItem>
          <SelectItem value="EXPIRED">Vencida</SelectItem>
        </SelectContent>
      </Select>

      {/* Botón para limpiar filtros */}
      {columnFilters.length > 0 && (
        <Button
          variant="ghost"
          onClick={() => table.resetColumnFilters()}
          className="h-8 px-2 lg:px-3"
        >
          Reiniciar
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
