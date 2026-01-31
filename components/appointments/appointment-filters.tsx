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
import { APPOINTMENT_TYPES_MAP } from "@/config/constants";

interface AppointmentFiltersProps<TData> {
  table: Table<TData>;
}

export function AppointmentFilters<TData>({
  table,
}: AppointmentFiltersProps<TData>) {
  const columnFilters = table.getState().columnFilters;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={(table.getColumn("type")?.getFilterValue() as string) ?? "ALL"}
        onValueChange={(value) => {
          if (value === "ALL") table.getColumn("type")?.setFilterValue("");
          else table.getColumn("type")?.setFilterValue(value);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo de Sesión" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos los tipos</SelectItem>
          {Object.entries(APPOINTMENT_TYPES_MAP).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
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
