"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, CreditCard, FilePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // <--- Importante
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { createAuthorization } from "@/lib/actions/authorizations";
import {
  authorizationSchema,
  AuthorizationFormValues,
} from "@/lib/schemas/authorization";

interface AddAuthorizationModalProps {
  patientId: string;
  insurerId: string | null; // Recibimos la aseguradora del paciente por defecto
  insurerName: string | undefined;
  hasActiveAuth: boolean;
}

export function AddAuthorizationModal({
  patientId,
  insurerId,
  insurerName,
  hasActiveAuth,
}: AddAuthorizationModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      patientId: patientId,
      insurerId: insurerId || "",
      code: "",
      totalSessions: 10,
      validFrom: new Date(),
      validUntil: addMonths(new Date(), 3),
      previousAuthAction: hasActiveAuth ? "COMPLETED" : undefined,
    },
  });

  async function onSubmit(data: AuthorizationFormValues) {
    startTransition(async () => {
      const result = await createAuthorization(data);

      if (result.success) {
        toast.success("Autorización registrada correctamente");
        setOpen(false); // Cerramos el modal
        form.reset(); // Limpiamos el formulario
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <FilePlus className="h-4 w-4" /> Nueva Autorización
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Autorización</DialogTitle>
          <DialogDescription>
            Registra un nuevo paquete de sesiones para{" "}
            <strong>{insurerName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {hasActiveAuth && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Autorización Activa Detectada</AlertTitle>
                <AlertDescription className="mt-2">
                  El paciente ya tiene un paquete activo. ¿Qué deseas hacer con
                  el anterior?
                  <FormField
                    control={form.control}
                    name="previousAuthAction"
                    render={({ field }) => (
                      <FormItem className="space-y-3 mt-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="COMPLETED" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Marcar como <strong>Completada</strong>{" "}
                                (Finalizó OK)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="EXPIRED" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Marcar como <strong>Vencida/Anulada</strong>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AlertDescription>
              </Alert>
            )}
            {/* Campo Oculto: Insurer ID */}
            <input type="hidden" {...form.register("insurerId")} />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Autorización</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 987654321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalSessions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad de Sesiones</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      // --- EL ARREGLO ESTÁ AQUÍ ---
                      // Forzamos el tipo a number para calmar a TypeScript
                      value={field.value as number}
                      // Aseguramos que el cambio se pase correctamente al form
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Válida Desde</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Seleccionar</span>
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
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Vence El</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Seleccionar</span>
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
                          disabled={(date) => date < new Date()} // No puede vencer en el pasado
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Paquete
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
