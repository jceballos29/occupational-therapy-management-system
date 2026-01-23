"use client"

import { useState, useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { updateAppointment } from "@/lib/actions/appointments"
import { appointmentSchema, type AppointmentFormValues } from "@/lib/schemas/appointment"
import { APPOINTMENT_TYPES_MAP } from "@/config/constants"
import { AppointmentType, PatientType } from "@prisma/client"

interface EditAppointmentModalProps {
  appointment: {
    id: string
    patientId: string
    doctorId: string
    startTime: Date
    type: AppointmentType
    priceTotal: number | null
    priceCopay: number | null
    notes: string | null
  }
  patientType: PatientType
  doctors: { id: string; firstName: string; lastName: string }[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAppointmentModal({ 
  appointment, 
  patientType, 
  doctors, 
  open, 
  onOpenChange 
}: EditAppointmentModalProps) {
  const [isPending, startTransition] = useTransition()

  // Extraer hora y minutos de UTC
  const startDate = new Date(appointment.startTime)
  const hours = String(startDate.getUTCHours()).padStart(2, '0')
  const minutes = String(startDate.getUTCMinutes()).padStart(2, '0')
  const initialTime = `${hours}:${minutes}`

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: new Date(appointment.startTime),
      time: initialTime,
      duration: 45, // Asumir 45 min por defecto
      type: appointment.type,
      price: appointment.priceTotal || 0,
      copayAmount: appointment.priceCopay || 0,
      description: appointment.notes || undefined,
    },
  })

  // Resetear el formulario cuando cambie la cita
  useEffect(() => {
    const startDate = new Date(appointment.startTime)
    const hours = String(startDate.getUTCHours()).padStart(2, '0')
    const minutes = String(startDate.getUTCMinutes()).padStart(2, '0')
    
    form.reset({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: new Date(appointment.startTime),
      time: `${hours}:${minutes}`,
      duration: 45,
      type: appointment.type,
      price: appointment.priceTotal || 0,
      copayAmount: appointment.priceCopay || 0,
      description: appointment.notes || undefined,
    })
  }, [appointment, form])

  async function onSubmit(data: AppointmentFormValues) {
    startTransition(async () => {
      const res = await updateAppointment(appointment.id, data)
      if (res.success) {
        toast.success("Cita actualizada")
        onOpenChange(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar Cita</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
            {/* Doctor */}
            <FormField control={form.control} name="doctorId" render={({ field }) => (
              <FormItem>
                <FormLabel>Profesional</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        Dr. {d.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              {/* Fecha */}
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elegir</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Hora */}
              <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tipo de Cita */}
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(APPOINTMENT_TYPES_MAP).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Duración */}
              <FormField control={form.control} name="duration" render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Duración (min)</FormLabel>
                  <Select onValueChange={(val) => onChange(parseInt(val))} value={value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Precio */}
              <FormField control={form.control} name="price" render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 100000"
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : e.target.valueAsNumber
                        onChange(isNaN(val) ? 0 : val)
                      }}
                      value={value}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Copago - Mostrar para COPAY y PACKAGE */}
              {(patientType === 'INSURANCE_COPAY' || patientType === 'INSURANCE_PACKAGE') && (
                <FormField control={form.control} name="copayAmount" render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-blue-600">Copago Paciente</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : e.target.valueAsNumber
                          onChange(isNaN(val) ? 0 : val)
                        }}
                        value={value ?? 0}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>

            {(patientType === 'INSURANCE_COPAY' || patientType === 'INSURANCE_PACKAGE') && (
              <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded border">
                <p>La aseguradora pagará: <strong>
                  ${((form.watch("price") || 0) - (form.watch("copayAmount") || 0)).toLocaleString()}
                </strong></p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
