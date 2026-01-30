"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { updateAuthorization } from "@/lib/actions/authorizations"
import { authorizationSchema, AuthorizationFormValues } from "@/lib/schemas/authorization"
import { Authorization } from "@/lib/generated/prisma/browser"

interface EditAuthorizationDialogProps {
  authorization: Authorization
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAuthorizationDialog({ authorization, open, onOpenChange }: EditAuthorizationDialogProps) {
  const [isPending, startTransition] = useTransition()

  // Precargamos los datos existentes
  const form = useForm({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      patientId: authorization.patientId,
      insurerId: authorization.insurerId,
      code: authorization.code,
      totalSessions: authorization.totalSessions,
      validFrom: authorization.validFrom,
      validUntil: authorization.validUntil,
    },
  })

  async function onSubmit(data: AuthorizationFormValues) {
    startTransition(async () => {
      const result = await updateAuthorization(authorization.id, data)
      
      if (result.success) {
        toast.success("Autorización actualizada")
        onOpenChange(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Autorización</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Reutilizamos los campos igual que en AddModal */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Total Sesiones</FormLabel>
                  <FormControl>
                    <Input 
                        type="number" 
                        {...field} 
                        value={field.value as number}
                        onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fechas (Simplificado para el ejemplo, usa el mismo Popover que AddModal) */}
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Vence</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Elegir</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}