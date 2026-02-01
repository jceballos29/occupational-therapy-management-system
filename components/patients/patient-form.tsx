"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon,
  Contact,
  Shield,
  SquareUser,
  Stethoscope,
  UserCog,
} from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { DOCUMENT_TYPES_MAP, genderLabels } from "@/config/constants";
import { Doctor, Insurer, Patient } from "@/lib/generated/prisma/browser";
import { DocumentType, PatientType } from "@/lib/generated/prisma/enums";
import { patientFormSchema, PatientFormValues } from "@/lib/schemas/patient";

interface PatientFormProps {
  formId: string;
  patient?: Patient;
  insurers: Insurer[];
  doctors: Doctor[];
  onSubmit: (data: PatientFormValues) => void;
  isPending: boolean;
}

export function PatientForm({
  formId,
  patient,
  insurers,
  doctors,
  onSubmit,
  isPending,
}: PatientFormProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      documentType: patient?.documentType || DocumentType.CC,
      documentId: patient?.documentId || "",
      email: patient?.email || "",
      phone: patient?.phone || "",
      birthDate: patient?.birthDate || undefined,
      gender: patient?.gender || "MALE",
      type: patient?.type || PatientType.PRIVATE,
      insurerId: patient?.insurerId || "",
      treatingDoctorId:
        patient?.treatingDoctorId || doctors.length === 1
          ? doctors[0].id
          : undefined,
    },
  });

  // Watch para lógica condicional
  const selectedType = form.watch("type");
  const selectedInsurerId = form.watch("insurerId");

  // Encontrar la aseguradora seleccionada
  const selectedInsurer = insurers.find((ins) => ins.id === selectedInsurerId);
  const isPrivateInsurer = selectedInsurer?.isPrivate || false;

  // Auto-set type to PRIVATE when private insurer is selected
  useEffect(() => {
    if (isPrivateInsurer && selectedType !== PatientType.PRIVATE) {
      form.setValue("type", PatientType.PRIVATE);
    }
  }, [isPrivateInsurer, selectedType, form]);

  return (
    // <form
    //   id="patient-form"
    //   onSubmit={form.handleSubmit(onSubmit)}
    //   className="space-y-6"
    // >
    //   <FieldGroup>
    //     {/* SECCIÓN: DATOS PERSONALES */}
    //     <section className="space-y-4">
    //       <div className="flex items-center gap-2 border-b pb-2">
    //         <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
    //           <User className="h-4 w-4 text-primary" />
    //         </div>
    //         <h3 className="font-semibold text-foreground">Datos Personales</h3>
    //       </div>

    //       <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
    //         <Controller
    //           control={form.control}
    //           name="firstName"
    //           render={({ field, fieldState }) => (
    //             <Field data-invalid={fieldState.invalid}>
    //               <FieldLabel>Nombres</FieldLabel>
    //               <Input {...field} id={field.name} placeholder="Juan" />
    //               {fieldState.invalid && (
    //                 <FieldError errors={[fieldState.error]} />
    //               )}
    //             </Field>
    //           )}
    //         />

    //         <Controller
    //           control={form.control}
    //           name="lastName"
    //           render={({ field, fieldState }) => (
    //             <Field data-invalid={fieldState.invalid}>
    //               <FieldLabel>Apellidos</FieldLabel>
    //               <Input {...field} id={field.name} placeholder="Pérez" />
    //               {fieldState.invalid && (
    //                 <FieldError errors={[fieldState.error]} />
    //               )}
    //             </Field>
    //           )}
    //         />
    //       </div>

    //       <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
    //         <Controller
    //           control={form.control}
    //           name="documentType"
    //           render={({ field, fieldState }) => (
    //             <Field data-invalid={fieldState.invalid}>
    //               <FieldLabel>Tipo de Documento</FieldLabel>
    //               <Select
    //                 name={field.name}
    //                 onValueChange={field.onChange}
    //                 defaultValue={field.value}
    //               >
    //                 <SelectTrigger
    //                   id={field.name}
    //                   aria-invalid={fieldState.invalid}
    //                   className="w-full"
    //                 >
    //                   <SelectValue placeholder="Seleccionar" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   {Object.entries(DOCUMENT_TYPES_MAP).map(
    //                     ([key, label]) => (
    //                       <SelectItem key={key} value={key}>
    //                         {key} - {label}
    //                       </SelectItem>
    //                     ),
    //                   )}
    //                 </SelectContent>
    //               </Select>
    //               {fieldState.invalid && (
    //                 <FieldError errors={[fieldState.error]} />
    //               )}
    //             </Field>
    //           )}
    //         />

    //         <Controller
    //           control={form.control}
    //           name="documentId"
    //           render={({ field, fieldState }) => (
    //             <Field data-invalid={fieldState.invalid}>
    //               <FieldLabel>Número de Documento</FieldLabel>
    //               <Input {...field} id={field.name} placeholder="123456789" />
    //               {fieldState.invalid && (
    //                 <FieldError errors={[fieldState.error]} />
    //               )}
    //             </Field>
    //           )}
    //         />
    //       </div>

    //       <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
    //         <Controller
    //           control={form.control}
    //           name="birthDate"
    //           render={({ field, fieldState }) => (
    //             <Field data-invalid={fieldState.invalid}>
    //               <FieldLabel>Fecha de Nacimiento</FieldLabel>
    //               <Popover>
    //                 <PopoverTrigger asChild>
    //                   <Button
    //                     variant={"outline"}
    //                     className={cn(
    //                       "w-full pl-3 text-left font-normal",
    //                       !field.value && "text-muted-foreground",
    //                     )}
    //                   >
    //                     {field.value ? (
    //                       format(field.value, "PPP", { locale: es })
    //                     ) : (
    //                       <span>Seleccionar</span>
    //                     )}
    //                     <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
    //                   </Button>
    //                 </PopoverTrigger>
    //                 <PopoverContent className="w-auto p-0" align="start">
    //                   <Calendar
    //                     mode="single"
    //                     selected={field.value}
    //                     onSelect={field.onChange}
    //                     disabled={(date) =>
    //                       date > new Date() || date < new Date("1900-01-01")
    //                     }
    //                     captionLayout="dropdown"
    //                   />
    //                 </PopoverContent>
    //               </Popover>
    //               {fieldState.invalid && (
    //                 <FieldError errors={[fieldState.error]} />
    //               )}
    //             </Field>
    //           )}
    //         />

    //         <Controller
    //           control={form.control}
    //           name="gender"
    //           render={({ field, fieldState }) => (
    //             <Field data-invalid={fieldState.invalid}>
    //               <FieldLabel>Género</FieldLabel>
    //               <Select
    //                 name={field.name}
    //                 onValueChange={field.onChange}
    //                 defaultValue={field.value}
    //               >
    //                 <SelectTrigger
    //                   id={field.name}
    //                   aria-invalid={fieldState.invalid}
    //                   className="w-full"
    //                 >
    //                   <SelectValue placeholder="Seleccionar" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   {Object.entries(genderLabels).map(([key, label]) => (
    //                     <SelectItem key={key} value={key}>
    //                       {label}
    //                     </SelectItem>
    //                   ))}
    //                 </SelectContent>
    //               </Select>
    //               {fieldState.invalid && (
    //                 <FieldError errors={[fieldState.error]} />
    //               )}
    //             </Field>
    //           )}
    //         />
    //       </div>
    //     </section>

    //     <Separator />

    //     {/* SECCIÓN: CONTACTO */}
    //     <section className="space-y-4">
    //       <div className="flex items-center gap-2 border-b pb-2">
    //         <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
    //           <User className="h-4 w-4 text-accent-foreground" />
    //         </div>
    //         <h3 className="font-semibold text-foreground">
    //           Información de Contacto
    //         </h3>
    //       </div>

    //       <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
    //         <Controller
    //           control={form.control}
    //           name="phone"
    //           render={({ field, fieldState }) => (
    //             <Field data-invalid={fieldState.invalid}>
    //               <FieldLabel>Teléfono / Celular</FieldLabel>
    //               <Input
    //                 {...field}
    //                 id={field.name}
    //                 placeholder="300 123 4567"
    //               />
    //               {fieldState.invalid && (
    //                 <FieldError errors={[fieldState.error]} />
    //               )}
    //             </Field>
    //           )}
    //         />

    //         <Controller
    //           control={form.control}
    //           name="email"
    //           render={({ field, fieldState }) => (
    //             <Field data-invalid={fieldState.invalid}>
    //               <FieldLabel>Email (Opcional)</FieldLabel>
    //               <Input
    //                 {...field}
    //                 id={field.name}
    //                 type="email"
    //                 placeholder="correo@ejemplo.com"
    //               />
    //               {fieldState.invalid && (
    //                 <FieldError errors={[fieldState.error]} />
    //               )}
    //             </Field>
    //           )}
    //         />
    //       </div>
    //     </section>

    //     <Separator />

    //     {/* SECCIÓN: MÉDICO TRATANTE */}
    //     <section className="space-y-4">
    //       <div className="flex items-center gap-2 border-b pb-2">
    //         <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50">
    //           <Stethoscope className="h-4 w-4 text-blue-600" />
    //         </div>
    //         <h3 className="font-semibold text-foreground">Médico Tratante</h3>
    //       </div>

    //       <Controller
    //         control={form.control}
    //         name="treatingDoctorId"
    //         render={({ field, fieldState }) => (
    //           <Field data-invalid={fieldState.invalid}>
    //             <Select
    //               name={field.name}
    //               onValueChange={field.onChange}
    //               defaultValue={field.value}
    //             >
    //               <SelectTrigger
    //                 id={field.name}
    //                 aria-invalid={fieldState.invalid}
    //                 className="w-full"
    //               >
    //                 <SelectValue placeholder="Seleccionar doctor">
    //                   {field.value && (
    //                     <div className="flex items-center gap-2">
    //                       <div
    //                         className="w-4 h-4 rounded-full"
    //                         style={{
    //                           backgroundColor:
    //                             doctors.find((d) => d.id === field.value)
    //                               ?.colorCode || "gray",
    //                         }}
    //                       />
    //                       <span className="font-medium">
    //                         Dr.{" "}
    //                         {
    //                           doctors.find((d) => d.id === field.value)
    //                             ?.firstName
    //                         }{" "}
    //                         {
    //                           doctors.find((d) => d.id === field.value)
    //                             ?.lastName
    //                         }
    //                       </span>
    //                     </div>
    //                   )}
    //                 </SelectValue>
    //               </SelectTrigger>
    //               <SelectContent>
    //                 {doctors.map((doctor) => (
    //                   <SelectItem key={doctor.id} value={doctor.id}>
    //                     <div className="flex flex-col">
    //                       <div className="flex items-center gap-2">
    //                         <div
    //                           className="w-4 h-4 rounded-full"
    //                           style={{
    //                             backgroundColor: doctor.colorCode || "gray",
    //                           }}
    //                         />
    //                         <span className="font-medium">
    //                           Dr. {doctor.firstName} {doctor.lastName}
    //                         </span>
    //                       </div>
    //                       <span className="text-xs text-muted-foreground">
    //                         Terapeuta de Ocupación
    //                       </span>
    //                     </div>
    //                   </SelectItem>
    //                 ))}
    //               </SelectContent>
    //             </Select>
    //             {fieldState.invalid && (
    //               <FieldError errors={[fieldState.error]} />
    //             )}
    //           </Field>
    //         )}
    //       />
    //     </section>

    //     <Separator />

    //     {/* SECCIÓN: ASEGURADORA */}
    //     <section className="space-y-4">
    //       <div className="flex items-center gap-2 border-b pb-2">
    //         <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
    //           <Shield className="h-4 w-4 text-primary" />
    //         </div>
    //         <h3 className="font-semibold text-foreground">Aseguradora</h3>
    //       </div>

    //       <Controller
    //         control={form.control}
    //         name="insurerId"
    //         render={({ field, fieldState }) => (
    //           <Field data-invalid={fieldState.invalid}>
    //             <Select
    //               name={field.name}
    //               onValueChange={field.onChange}
    //               defaultValue={field.value}
    //             >
    //               <SelectTrigger
    //                 id={field.name}
    //                 aria-invalid={fieldState.invalid}
    //                 className="w-full"
    //               >
    //                 <SelectValue placeholder="Seleccionar aseguradora" />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 {/* Grupo de aseguradoras privadas */}
    //                 <SelectGroup>
    //                   <SelectLabel>Privado</SelectLabel>
    //                   {insurers
    //                     .filter((ins) => ins.isPrivate)
    //                     .map((ins) => (
    //                       <SelectItem key={ins.id} value={ins.id}>
    //                         {ins.name}
    //                       </SelectItem>
    //                     ))}
    //                 </SelectGroup>

    //                 {/* Grupo de aseguradoras de salud */}
    //                 <SelectGroup>
    //                   <SelectLabel>Empresas de Salud</SelectLabel>
    //                   {insurers
    //                     .filter((ins) => !ins.isPrivate)
    //                     .map((ins) => (
    //                       <SelectItem key={ins.id} value={ins.id}>
    //                         {ins.name}
    //                       </SelectItem>
    //                     ))}
    //                 </SelectGroup>
    //               </SelectContent>
    //             </Select>
    //             {fieldState.invalid && (
    //               <FieldError errors={[fieldState.error]} />
    //             )}
    //           </Field>
    //         )}
    //       />
    //     </section>

    //     {/* SECCIÓN: TIPO DE CONVENIO (solo si NO es aseguradora privada) */}
    //     {!isPrivateInsurer && (
    //       <section className="space-y-4">
    //         <div className="flex items-center gap-2 border-b pb-2">
    //           <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
    //             <UserCog className="h-4 w-4 text-secondary-foreground" />
    //           </div>
    //           <h3 className="font-semibold text-foreground">
    //             Tipo de Convenio
    //           </h3>
    //         </div>

    //         <Controller
    //           control={form.control}
    //           name="type"
    //           render={({ field, fieldState }) => {
    //             const isInvalid = fieldState.invalid;
    //             return (
    //               <FieldSet data-invalid={isInvalid}>
    //                 <RadioGroup
    //                   name={field.name}
    //                   value={field.value}
    //                   onValueChange={field.onChange}
    //                   aria-invalid={isInvalid}
    //                 >
    //                   <FieldLabel htmlFor={field.name}>
    //                     <Field orientation="horizontal">
    //                       <FieldContent>
    //                         <FieldTitle>Copago</FieldTitle>
    //                         <FieldDescription>
    //                           El paciente paga el copago de la sesión y el resto
    //                           se paga a la empresa de salud
    //                         </FieldDescription>
    //                       </FieldContent>
    //                       <RadioGroupItem
    //                         value={PatientType.INSURANCE_COPAY}
    //                         id={PatientType.INSURANCE_COPAY}
    //                       />
    //                     </Field>
    //                   </FieldLabel>
    //                   <FieldLabel htmlFor={field.name}>
    //                     <Field orientation="horizontal">
    //                       <FieldContent>
    //                         <FieldTitle>Paquete</FieldTitle>
    //                         <FieldDescription>
    //                           La empresa de salud paga la totalidad del paquete
    //                           de sesiones
    //                         </FieldDescription>
    //                       </FieldContent>
    //                       <RadioGroupItem
    //                         value={PatientType.INSURANCE_PACKAGE}
    //                         id={PatientType.INSURANCE_PACKAGE}
    //                       />
    //                     </Field>
    //                   </FieldLabel>
    //                 </RadioGroup>
    //                 {isInvalid && <FieldError errors={[fieldState.error]} />}
    //               </FieldSet>
    //             );
    //           }}
    //         />
    //       </section>
    //     )}
    //   </FieldGroup>

    //   <div className="flex justify-end gap-4 pt-4">
    //     {showCancelButton && (
    //       <Button
    //         variant="outline"
    //         type="button"
    //         onClick={onCancel || (() => window.history.back())}
    //         disabled={isPending}
    //       >
    //         Cancelar
    //       </Button>
    //     )}
    //     <Button type="submit" disabled={isPending} size="sm">
    //       {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
    //       <Save className="h-4 w-4" />
    //       Guardar Paciente
    //     </Button>
    //   </div>
    // </form>
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-6 pb-6"
    >
      <FieldGroup>
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 shadow-xs">
              <SquareUser className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Datos personales</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <Controller
              control={form.control}
              name="firstName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Nombres</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder="Pepito"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="lastName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Apellidos</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder="Perez"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <Controller
              control={form.control}
              name="documentType"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tipo Documento</FieldLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DOCUMENT_TYPES_MAP).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="documentId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Número Documento</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder="12345678"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <Controller
              control={form.control}
              name="birthDate"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Fecha de Nacimiento</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        locale={es}
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="gender"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Género</FieldLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(genderLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 shadow-xs">
              <Contact className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Datos de contacto</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <Controller
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Teléfono</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder="12345678"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="flex items-center justify-between">Email <span className="text-muted-foreground text-xs">(Opcional)</span></FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder="pepito@gmail.com"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 shadow-xs">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Datos administrativos</h3>
          </div>
          <Controller
            control={form.control}
            name="treatingDoctorId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Médico tratante</FieldLabel>
                <Select
                  name={field.name}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                    className="w-full"
                  >
                    <SelectValue placeholder="Sin asignar">
                      {field.value && (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor:
                                doctors.find((d) => d.id === field.value)
                                  ?.colorCode || "gray",
                            }}
                          />
                          <span className="font-medium">
                            Dr.{" "}
                            {
                              doctors.find((d) => d.id === field.value)
                                ?.firstName
                            }{" "}
                            {
                              doctors.find((d) => d.id === field.value)
                                ?.lastName
                            }
                          </span>
                          |
                          <span className="ml-auto text-xs text-muted-foreground">
                            {
                              doctors.find((d) => d.id === field.value)
                                ?.speciality
                            }
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex flex-col">
                          <div className="w-full flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor: doctor.colorCode || "gray",
                              }}
                            />
                            <span className="font-medium">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </span>{" "}
                            |
                            <span className="text-xs text-muted-foreground">
                              {doctor.speciality}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="insurerId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Aseguradora</FieldLabel>
                <Select
                  name={field.name}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                    className="w-full"
                  >
                    <SelectValue placeholder="Seleccionar aseguradora" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Grupo de aseguradoras privadas */}
                    <SelectGroup>
                      <SelectLabel>Privado</SelectLabel>
                      {insurers
                        .filter((ins) => ins.isPrivate)
                        .map((ins) => (
                          <SelectItem key={ins.id} value={ins.id}>
                            {ins.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>

                    {/* Grupo de aseguradoras de salud */}
                    <SelectGroup>
                      <SelectLabel>Empresas de Salud</SelectLabel>
                      {insurers
                        .filter((ins) => !ins.isPrivate)
                        .map((ins) => (
                          <SelectItem key={ins.id} value={ins.id}>
                            {ins.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {selectedInsurerId && !isPrivateInsurer && (
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => {
                const isInvalid = fieldState.invalid;
                return (
                  <FieldSet data-invalid={isInvalid}>
                    <FieldLabel>Tipo de convenio</FieldLabel>
                    <RadioGroup
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={isInvalid}
                      className="grid grid-cols-2 gap-2"
                    >
                      <FieldLabel htmlFor={field.name}>
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Copago</FieldTitle>
                          </FieldContent>
                          <RadioGroupItem
                            value={PatientType.INSURANCE_COPAY}
                            id={PatientType.INSURANCE_COPAY}
                          />
                        </Field>
                      </FieldLabel>
                      <FieldLabel htmlFor={field.name}>
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Paquete</FieldTitle>
                          </FieldContent>
                          <RadioGroupItem
                            value={PatientType.INSURANCE_PACKAGE}
                            id={PatientType.INSURANCE_PACKAGE}
                          />
                        </Field>
                      </FieldLabel>
                    </RadioGroup>
                    {isInvalid && <FieldError errors={[fieldState.error]} />}
                  </FieldSet>
                );
              }}
            />
          )}
        </section>
      </FieldGroup>
    </form>
  );
}
