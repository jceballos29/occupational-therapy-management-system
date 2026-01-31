"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { createPatient } from "@/lib/actions/patients";
import { Doctor, Insurer } from "@/lib/generated/prisma/browser";
import { PatientFormValues } from "@/lib/schemas/patient";
import { Loader2, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";
import { PatientForm } from "./patient-form";

interface AddPatientDialogProps {
  insurers: Insurer[];
  doctors: Doctor[];
}

export function AddPatientDialog({ insurers, doctors }: AddPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(data: PatientFormValues) {
    startTransition(async () => {
      const result = await createPatient(data);
      if (result.success) {
        toast.success("Paciente creado correctamente");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4" />
          Nuevo Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <UserPlus className="h-4 w-4 text-primary" />
            </div>
            Registrar Nuevo Paciente
          </DialogTitle>
          <DialogDescription>
            Ingresa los datos personales y de afiliación del paciente.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-240px)]">
          <PatientForm
            formId="add-patient-form"
            insurers={insurers}
            doctors={doctors}
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
          <Button type="submit" form="add-patient-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
