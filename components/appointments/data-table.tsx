"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X 
} from "lucide-react"
import { APPOINTMENT_TYPES_MAP } from "@/config/constants" // <--- Importamos el mapa

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function AppointmentsDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
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
        pagination: { pageSize: 5 } 
    }
  })

  // Función auxiliar para generar números de página
  // Esto crea un array tipo [0, 1, 2] para mapear botones
  const pageCount = table.getPageCount()
  const pageIndex = table.getState().pagination.pageIndex
  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i)

  // Lógica para no mostrar 100 botones si hay muchas páginas (Muestra ventana de 5)
  const visiblePages = pageNumbers.filter(
    (p) => p >= pageIndex - 2 && p <= pageIndex + 2
  )

  return (
    <div className="space-y-4">
      {/* 1. FILTROS AVANZADOS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        
        {/* Filtro por Tipo de Cita (Select en vez de Input) */}
        <div className="flex items-center gap-2">
            <Select 
                value={(table.getColumn("type")?.getFilterValue() as string) ?? "ALL"} 
                onValueChange={(value) => {
                    if (value === "ALL") table.getColumn("type")?.setFilterValue("")
                    else table.getColumn("type")?.setFilterValue(value)
                }}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo de cita" />
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

            {/* Botón para limpiar filtros si hay alguno activo */}
            {columnFilters.length > 0 && (
                <Button 
                    variant="ghost" 
                    onClick={() => setColumnFilters([])}
                    className="h-8 px-2 lg:px-3"
                >
                    Reiniciar
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>

        {/* Buscador Global (Opcional, busca en todas las columnas visibles si configuras filterFn) */}
        {/* <Input ... /> */}
      </div>

      {/* 2. TABLA */}
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold text-slate-700">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-slate-50/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 3. PAGINACIÓN PROFESIONAL */}
      <div className="flex items-center justify-between px-2">
        
        {/* Selector de filas por página */}
        <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-muted-foreground">Filas:</p>
            <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                    table.setPageSize(Number(value))
                }}
            >
            <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
                {[5, 10, 20, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                    </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>

        {/* Información de página y Botones numéricos */}
        <div className="flex items-center gap-2">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium text-muted-foreground hidden sm:flex">
                Pág {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </div>
            
            <div className="flex items-center space-x-1">
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                >
                    <span className="sr-only">Primera</span>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <span className="sr-only">Anterior</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Renderizado de Números de Página */}
                {visiblePages.map((pageNum) => (
                    <Button
                        key={pageNum}
                        variant={pageIndex === pageNum ? "default" : "outline"}
                        className="h-8 w-8 p-0 hidden sm:flex"
                        onClick={() => table.setPageIndex(pageNum)}
                    >
                        {pageNum + 1}
                    </Button>
                ))}

                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <span className="sr-only">Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                >
                    <span className="sr-only">Última</span>
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>
    </div>
  )
}