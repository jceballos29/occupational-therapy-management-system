"use client";

import { useState, useTransition } from "react";
import { FilePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { ScrollArea } from "@/components/ui/scroll-area";

import { createAuthorization } from "@/lib/actions/authorizations";
import { AuthorizationFormValues } from "@/lib/schemas/authorization";
import { AuthorizationForm } from "./authorization-form";

interface AddAuthorizationModalProps {
  patientId: string;
  insurerId: string | null;
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

  async function onSubmit(data: AuthorizationFormValues) {
    startTransition(async () => {
      const result = await createAuthorization(data);

      if (result.success) {
        toast.success("Autorización registrada correctamente");
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
          <FilePlus className="h-4 w-4" /> Nueva Autorización
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 shadow-sm">
              <FilePlus className="h-4 w-4 text-primary" />
            </div>
            Nueva Autorización
          </DialogTitle>
          <DialogDescription>
            Registra un nuevo paquete de sesiones para{" "}
            <strong>{insurerName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-240px)]">
          <AuthorizationForm
            formId="add-authorization-form"
            patientId={patientId}
            insurerId={insurerId || ""}
            insurerName={insurerName || ""}
            hasActiveAuth={hasActiveAuth}
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
            form="add-authorization-form"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Paquete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
