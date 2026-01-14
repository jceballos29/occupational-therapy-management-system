"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, FileText, UserCog, Copy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner" // O tu librería de toast preferida
import { PatientWithRelations } from "@/types/patient"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { DOCUMENT_TYPES_MAP, DOCUMENT_TYPE_COLORS, patientTypeColors, patientTypeLabels } from "@/config/constants"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export const columns: ColumnDef<PatientWithRelations>[] = [
  {
    accessorKey: "firstName",
    header: "Paciente",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            {/* <AvatarImage src={row.original.avatarUrl || undefined} alt={`${row.original.firstName} ${row.original.lastName}`} /> */}
            <AvatarFallback>
              {row.original.firstName.charAt(0)}
              {row.original.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-slate-900">
            {row.original.firstName} {row.original.lastName}
          </span>
        </div>
      )
    }
  },
  // {
  //   accessorKey: "email",
  //   header: "Email",
  //   cell: ({ row }) => (
  //     <span className="text-sm text-slate-600">
  //       {row.original.email || <span className="text-slate-400 italic">No proporcionado</span>}
  //     </span>
  //   )
  // },
  // {
  //   accessorKey: "birthDate",
  //   header: "Fecha de Nacimiento",
  //   cell: ({ row }) => (
  //     <span className="text-sm text-slate-600">
  //       {format(row.original.birthDate, "PPP", { locale: es })}
  //     </span>
  //   )
  // },
  {
    accessorKey: "documentType",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.original.documentType
      return (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={`font-mono text-[10px] px-2 py-0.5 cursor-help ${DOCUMENT_TYPE_COLORS[type] || "bg-slate-100"}`}
              >
                {type}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{DOCUMENT_TYPES_MAP[type]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    accessorKey: "documentId",
    header: "Documento",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.documentId}</span>
  },
  {
    accessorKey: "type",
    header: "Afiliación",
    cell: ({ row }) => {
      const type = row.original.type
      return (
        <Badge className={patientTypeColors[type]} variant="outline">
          {patientTypeLabels[type] || type}
        </Badge>
      )
    },
  },
  {
    id: "insurer",
    header: "Aseguradora",
    cell: ({ row }) => {
      const insurer = row.original.insurer
      const type = row.original.type

      if (type === 'PRIVATE') return <span className="text-slate-400 text-sm">-</span>

      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{insurer?.name || "Sin Asignar"}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "treatingDoctor",
    header: "Médico Tratante",
    cell: ({ row }) => {
      const doctor = row.original.treatingDoctor
      return doctor ? (
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: doctor.colorCode || '#ccc' }}
          />
          <span className="text-sm">Dr. {doctor.lastName}</span>
        </div>
      ) : (
        <span className="text-xs text-slate-400 italic">No asignado</span>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(patient.documentId)
                toast.success("Documento copiado al portapapeles") 
              }}
            >
              <Copy className="mr-2 h-4 w-4 text-slate-500" />
              Copiar documento
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/patients/${patient.id}`} className="cursor-pointer flex items-center w-full">
                <FileText className="mr-2 h-4 w-4 text-slate-500" />
                Ver Historia Clínica
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserCog className="mr-2 h-4 w-4 text-slate-500" />
              Editar Datos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]