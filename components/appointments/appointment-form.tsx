"use client";

import {
  Appointment,
  AppointmentType,
  Doctor,
  PatientType,
} from "@/lib/generated/prisma/browser";
import {
  AppointmentFormValues,
  appointmentSchema,
} from "@/lib/schemas/appointment";
import { SerializedTariff } from "@/types/patient";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { CalendarIcon, Clock, DollarSign, FileText, Stethoscope } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn, extractTime } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../ui/calendar";
import { APPOINTMENT_TYPES_MAP } from "@/config/constants";
import { Textarea } from "../ui/textarea";

interface AppointmentFormProps {
  formId: string;
  appointment?: Appointment;
  patientId: string;
  patientType: PatientType;
  tariffs?: SerializedTariff[];
  doctors: Doctor[];
  treatingDoctor: Doctor;
  onSubmit: (data: AppointmentFormValues) => void;
  isPending: boolean;
}

export function AppointmentForm({
  formId,
  appointment,
  patientId,
  patientType,
  tariffs,
  doctors,
  treatingDoctor,
  onSubmit,
  isPending,
}: AppointmentFormProps) {
  const [isChangingDoctor, setIsChangingDoctor] = useState(false);
  // Filtrar solo tarifas activas y del tipo correcto
  const activeTariffs =
    tariffs?.filter((t) => t.active && t.type === patientType) || [];

  // Si solo hay una tarifa, usar sus valores por defecto
  const defaultTariff = activeTariffs.length === 1 ? activeTariffs[0] : null;

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId,
      doctorId: treatingDoctor.id,
      date: appointment?.startTime || new Date(),
      time: appointment ? extractTime(appointment.startTime) : "09:00",
      duration: 45,
      type: appointment?.type || AppointmentType.FOLLOW_UP,
      price: appointment?.priceTotal
        ? Number(appointment.priceTotal)
        : defaultTariff?.costTotal || 0,
      copayAmount: appointment?.priceCopay
        ? Number(appointment.priceCopay)
        : defaultTariff?.copayAmount || 0,
      description: appointment?.notes || "",
    },
  });

  const handleTariffSelect = (tariffId: string) => {
    const selectedTariff = activeTariffs.find((t) => t.id === tariffId);
    if (selectedTariff) {
      form.setValue("price", selectedTariff.costTotal);
      form.setValue("copayAmount", selectedTariff.copayAmount);
    }
  };

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-6 pb-6"
    >
      <FieldGroup>
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 shadow-xs">
              <Stethoscope className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Médico tratante</h3>
            <div className="ml-auto">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsChangingDoctor(!isChangingDoctor);
                }}
                variant="ghost"
                size="sm"
                className="cursor-pointer text-xs"
              >
                {isChangingDoctor ? "Cancelar" : "Cambiar"}
              </Button>
            </div>
          </div>
          {isChangingDoctor ? (
            <Controller
              control={form.control}
              name="doctorId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
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
          ) : (
            <>
              <div className="flex items-center gap-1 rounded-md border py-2 px-3 mb-0 bg-muted/50">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{
                    backgroundColor: treatingDoctor.colorCode || "grey",
                  }}
                />
                <p className="font-medium text-sm">
                  Dr. {treatingDoctor.firstName} {treatingDoctor.lastName}
                </p>
                <p className="ml-auto text-xs text-muted-foreground">
                  {treatingDoctor.speciality}
                </p>
              </div>
              <input
                type="hidden"
                {...form.register("doctorId")}
                value={treatingDoctor.id}
                className="hidden"
              />
            </>
          )}
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 shadow-xs">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Fecha y hora</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <Controller
              control={form.control}
              name="date"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Fecha</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
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
                        disabled={(date) => date < new Date("1900-01-01")}
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
              name="time"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Hora</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="time"
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
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
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              Detalles de la sesión
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tipo</FieldLabel>
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
                      {Object.entries(APPOINTMENT_TYPES_MAP).map(
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
              name="duration"
              render={({
                field: { value, onChange, ...field },
                fieldState,
              }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Duración</FieldLabel>
                  <Select
                    onValueChange={(val) => onChange(parseInt(val))}
                    value={value?.toString()}
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
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Selector de Tarifa (si hay múltiples opciones) */}
          {activeTariffs.length > 1 && (
            <div>
              <FieldLabel>Tarifa</FieldLabel>
              <Select onValueChange={handleTariffSelect}>
                <SelectTrigger className="w-full" disabled={isPending}>
                  <SelectValue placeholder="Seleccionar tarifa..." />
                </SelectTrigger>
                <SelectContent>
                  {activeTariffs.map((tariff) => (
                    <SelectItem key={tariff.id} value={tariff.id}>
                      {tariff.name} - ${tariff.costTotal.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Selecciona una tarifa para actualizar automáticamente los
                valores
              </FieldDescription>
            </div>
          )}

          {defaultTariff && activeTariffs.length === 1 && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border">
              <p>
                Tarifa predeterminada: <strong>{defaultTariff.name}</strong>
              </p>
            </div>
          )}
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 shadow-xs">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Valores</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <Controller
              control={form.control}
              name="price"
              render={({
                field: { value, onChange, ...field },
                fieldState,
              }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Valor total</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    placeholder="Ej: 100000"
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? 0 : e.target.valueAsNumber;
                      onChange(isNaN(val) ? 0 : val);
                    }}
                    value={value}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {(patientType === PatientType.INSURANCE_COPAY ||
              patientType === PatientType.INSURANCE_PACKAGE) && (
              <Controller
                control={form.control}
                name="copayAmount"
                render={({
                  field: { value, onChange, ...field },
                  fieldState,
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-blue-600">
                      Copago paciente
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      placeholder="0"
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? 0 : e.target.valueAsNumber;
                        onChange(isNaN(val) ? 0 : val);
                      }}
                      value={value ?? 0}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}
          </div>

          {(patientType === PatientType.INSURANCE_COPAY ||
            patientType === PatientType.INSURANCE_PACKAGE) && (
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md border border-blue-200">
              <p>
                La aseguradora pagará:{" "}
                <strong>
                  $
                  {(
                    (form.watch("price") || 0) -
                    (form.watch("copayAmount") || 0)
                  ).toLocaleString()}
                </strong>
              </p>
            </div>
          )}
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 shadow-xs">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Notas (opcional)</h3>
          </div>

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Observaciones adicionales sobre la sesión..."
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  rows={3}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </section>
      </FieldGroup>
    </form>
  );
}
