"use client";

import { useTransition } from "react";
import { Loader2, Edit } from "lucide-react";
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
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { updateAuthorization } from "@/lib/actions/authorizations";
import { AuthorizationFormValues } from "@/lib/schemas/authorization";
import { Authorization } from "@/lib/generated/prisma/browser";
import { AuthorizationForm } from "./authorization-form";

interface EditAuthorizationDialogProps {
  authorization: Authorization;
  insurerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAuthorizationDialog({
  authorization,
  insurerName,
  open,
  onOpenChange,
}: EditAuthorizationDialogProps) {
  const [isPending, startTransition] = useTransition();

  async function onSubmit(data: AuthorizationFormValues) {
    startTransition(async () => {
      const result = await updateAuthorization(authorization.id, data);

      if (result.success) {
        toast.success("Autorización actualizada");
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Edit className="h-4 w-4 text-primary" />
            </div>
            Editar Autorización
          </DialogTitle>
          <DialogDescription>
            Actualiza la información del paquete de sesiones para{" "}
            <strong>{insurerName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-240px)]">
          <AuthorizationForm
            formId="edit-authorization-form"
            authorization={authorization}
            patientId={authorization.patientId}
            insurerId={authorization.insurerId}
            insurerName={insurerName}
            hasActiveAuth={false}
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
            form="edit-authorization-form"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
