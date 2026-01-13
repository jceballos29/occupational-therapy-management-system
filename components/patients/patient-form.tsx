"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2, Save } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner" // Asumiendo que usas Sonner o tu toast preferido

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { patientFormSchema, PatientFormValues } from "@/lib/schemas/patient"
import { createPatient } from "@/lib/actions/patients"
import { DocumentType, PatientType } from "@/lib/generated/prisma/enums"
import { DOCUMENT_TYPES_MAP } from "@/config/constants"

// Definimos las props que recibirá el componente (listas para los selects)
interface PatientFormProps {
  insurers: { id: string; name: string }[]
  doctors: { id: string; lastName: string; firstName: string }[]
}

export function PatientForm({ insurers, doctors }: PatientFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      documentType: DocumentType.CC,
      documentId: "",
      email: "",
      phone: "",
      type: PatientType.PRIVATE,
    },
  })

  // Watch para lógica condicional en la UI
  const selectedType = form.watch("type")

  async function onSubmit(data: PatientFormValues) {
    startTransition(async () => {
      const result = await createPatient(data)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Paciente creado correctamente")
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* SECCIÓN 1: DATOS PERSONALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input placeholder="Juan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos</FormLabel>
                <FormControl>
                  <Input placeholder="Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Documento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(DOCUMENT_TYPES_MAP).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {key} - {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Documento</FormLabel>
                <FormControl>
                  <Input placeholder="123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      captionLayout="dropdown"
                    //   fromYear={1920}
                    //   toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono / Celular</FormLabel>
                <FormControl>
                  <Input placeholder="300 123 4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="correo@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* SECCIÓN 2: AFILIACIÓN */}
        <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Información de Afiliación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <FormField
                    control={form.control}
                    name="treatingDoctorId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Médico Tratante</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Selecciona un doctor" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {doctors.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                                Dr. {doc.firstName} {doc.lastName}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tipo de Paciente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value={PatientType.PRIVATE}>Particular</SelectItem>
                            <SelectItem value={PatientType.INSURANCE_COPAY}>EPS / Copago</SelectItem>
                            <SelectItem value={PatientType.INSURANCE_PACKAGE}>Póliza / Paquete</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                {selectedType !== PatientType.PRIVATE && (
                    <FormField
                        control={form.control}
                        name="insurerId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Aseguradora</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Selecciona aseguradora..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {insurers.map((ins) => (
                                <SelectItem key={ins.id} value={ins.id}>
                                    {ins.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormDescription>
                                Requerido para pacientes no particulares.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
            </div>
        </div>

        <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => window.history.back()}>
                Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Guardar Paciente
            </Button>
        </div>
      </form>
    </Form>
  )
}