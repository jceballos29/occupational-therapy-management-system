"use client";

import {
  AuthorizationFormValues,
  authorizationSchema,
} from "@/lib/schemas/authorization";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { AlertCircle, CalendarIcon, FileText } from "lucide-react";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../ui/calendar";
import { Authorization } from "@/lib/generated/prisma/browser";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

interface AuthorizationFormProps {
  formId: string;
  authorization?: Authorization;
  patientId: string;
  insurerId: string;
  insurerName: string;
  hasActiveAuth: boolean;
  onSubmit: (data: AuthorizationFormValues) => void;
  isPending: boolean;
}

export function AuthorizationForm({
  formId,
  authorization,
  patientId,
  insurerId,
  insurerName,
  hasActiveAuth,
  onSubmit,
  isPending,
}: AuthorizationFormProps) {
  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      patientId: patientId,
      insurerId: authorization?.insurerId || insurerId,
      code: authorization?.code || "",
      totalSessions: authorization?.totalSessions || 10,
      validFrom: authorization?.validFrom || new Date(),
      validUntil: authorization?.validUntil || addMonths(new Date(), 3),
      previousAuthAction: hasActiveAuth ? "COMPLETED" : undefined,
    },
  });

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit)}
      className="px-6 pb-6"
    >
      <FieldGroup>
        {/* Alerta de autorización activa */}
        {hasActiveAuth && !authorization && (
          <Alert className="border-rose-200 bg-rose-50 text-rose-900">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Autorización Activa Detectada</AlertTitle>
            <AlertDescription className="mt-2">
              El paciente ya tiene un paquete activo. ¿Qué deseas hacer con el
              anterior?
              <Controller
                control={form.control}
                name="previousAuthAction"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="mt-3">
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="COMPLETED" id="completed" />
                        <Label
                          htmlFor="completed"
                          className="font-normal cursor-pointer"
                        >
                          Marcar como <strong>Completada</strong> (Finalizó OK)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="EXPIRED" id="expired" />
                        <Label
                          htmlFor="expired"
                          className="font-normal cursor-pointer"
                        >
                          Marcar como <strong>Vencida/Anulada</strong>
                        </Label>
                      </div>
                    </RadioGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </AlertDescription>
          </Alert>
        )}

        {/* Información del paquete */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-200">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-foreground">
              Información del paquete
            </h3>
          </div>

          {/* Campo oculto insurerId */}
          <input type="hidden" {...form.register("insurerId")} />

          <Controller
            control={form.control}
            name="code"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Código de Autorización</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Ej: 987654321"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="totalSessions"
            render={({ field: { value, onChange, ...field }, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Cantidad de Sesiones</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Ej: 10"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  value={value}
                  onChange={(e) => {
                    const val =
                      e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                    onChange(isNaN(val) ? 0 : val);
                  }}
                />
                <FieldDescription>
                  Número total de sesiones autorizadas en este paquete
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </section>

        {/* Vigencia */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-200">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-foreground">Vigencia</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <Controller
              control={form.control}
              name="validFrom"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Válida Desde</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={isPending}
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
              name="validUntil"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Vence El</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={isPending}
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
                        disabled={(date) => date < new Date()}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldDescription>
                    La fecha de vencimiento no puede ser anterior a la fecha de
                    inicio
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </section>
      </FieldGroup>
    </form>
  );
}
