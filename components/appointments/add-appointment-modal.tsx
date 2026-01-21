"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2, CalendarPlus2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { createAppointment } from "@/lib/actions/appointments"
import { appointmentSchema, type AppointmentFormValues } from "@/lib/schemas/appointment"

import { APPOINTMENT_TYPES_MAP } from "@/config/constants" // <--- Importamos el mapa
import { AppointmentType, PatientType } from "@/lib/generated/prisma/enums"

interface AddAppointmentModalProps {
  patientId: string
  patientType: PatientType
  doctors: { id: string; firstName: string; lastName: string }[]
}

export function AddAppointmentModal({ patientId, patientType, doctors }: AddAppointmentModalProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId,
      doctorId: doctors.length === 1 ? doctors[0].id : undefined,
      date: new Date(),
      time: "09:00",
      duration: 45,
      type: AppointmentType.FOLLOW_UP,
      price: 0,
      copayAmount: 0,
    },
  })

  async function onSubmit(data: AppointmentFormValues) {
    console.log("Form data before submit:", data)
    startTransition(async () => {
      const res = await createAppointment(data)
      if (res.success) {
        toast.success("Cita agendada")
        setOpen(false)
        form.reset({
          patientId,
          date: new Date(),
          time: "09:00",
          duration: 45,
          type: AppointmentType.FOLLOW_UP,
          price: 0,
          copayAmount: 0,
        })
      } else {
        console.error("Error from server:", res.error)
        toast.error(res.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <CalendarPlus2 className="h-4 w-4" /> Nueva Cita
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Agendar Cita</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
            {/* Doctor */}
            <FormField control={form.control} name="doctorId" render={({ field }) => (
              <FormItem >
                <FormLabel>Profesional</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} >
                  <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {doctors.map(d => <SelectItem key={d.id} value={d.id}>Dr. {d.lastName}</SelectItem>)}
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
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
              {/* Tipo de Cita (Dinámico con Mapa) */}
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
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

              {/* Precio (Manejo numérico seguro) */}
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
              {patientType === 'INSURANCE_COPAY' && (
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
              {patientType === 'INSURANCE_COPAY' && (
                <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded border">
                    <p>La aseguradora pagará: <strong>
                        ${((form.watch("price") || 0) - (form.watch("copayAmount") || 0)).toLocaleString()}
                    </strong></p>
                </div>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Agendar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}