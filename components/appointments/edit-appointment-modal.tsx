"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { updateAppointment } from "@/lib/actions/appointments";
import {
  appointmentSchema,
  type AppointmentFormValues,
} from "@/lib/schemas/appointment";
import { APPOINTMENT_TYPES_MAP } from "@/config/constants";
import { AppointmentType, PatientType } from "@/lib/generated/prisma/enums";
import { ScrollArea } from "../ui/scroll-area";
import { AppointmentForm } from "./appointment-form";
import { Doctor } from "@/lib/generated/prisma/browser";
import { SerializedTariff } from "@/types/patient";
import { AppointmentWithDoctor } from "./columns";

interface EditAppointmentModalProps {
  appointment: AppointmentWithDoctor;
  patientType: PatientType;
  tariffs?: SerializedTariff[];
  doctors: Doctor[];
  treatingDoctor: Doctor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAppointmentModal({
  appointment,
  patientType,
  tariffs,
  doctors,
  treatingDoctor,
  open,
  onOpenChange,
}: EditAppointmentModalProps) {
  const [isPending, startTransition] = useTransition();

  async function onSubmit(data: AppointmentFormValues) {
    startTransition(async () => {
      const res = await updateAppointment(appointment.id, data);
      if (res.success) {
        toast.success("Cita actualizada");
        onOpenChange(false);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <CalendarIcon className="h-4 w-4 text-primary" />
            </div>
            Editar sesión
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para editar la sesión.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-240px)]">
          <AppointmentForm
            formId="edit-appointment-form"
            patientId={appointment.patientId}
            patientType={patientType}
            tariffs={tariffs}
            doctors={doctors}
            treatingDoctor={treatingDoctor}
            onSubmit={onSubmit}
            isPending={isPending}
          />
        </ScrollArea>
        <DialogFooter className="p-6 pt-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="edit-appointment-form"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
