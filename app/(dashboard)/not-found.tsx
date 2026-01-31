import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-yellow-100 p-4">
            <FileQuestion className="h-10 w-10 text-yellow-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tight text-muted-foreground">
            404
          </h1>
          <h2 className="text-2xl font-semibold">Página no encontrada</h2>
          <p className="text-muted-foreground">
            Lo sentimos, no pudimos encontrar la página que estás buscando.
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link href="/patients">
            <Home className="h-4 w-4" />
            Volver a pacientes
          </Link>
        </Button>
      </div>
    </div>
  );
}
