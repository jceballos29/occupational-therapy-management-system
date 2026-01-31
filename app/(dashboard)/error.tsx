"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Algo salió mal</h1>
          <p className="text-muted-foreground">
            {error.message ||
              "Ha ocurrido un error inesperado. Por favor, intenta nuevamente."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Intentar nuevamente
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <a href="/patients">
              <Home className="h-4 w-4" />
              Volver al inicio
            </a>
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
