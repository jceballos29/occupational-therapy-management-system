"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { navLinks } from "@/config/nav";
import { useBreadcrumb } from "@/contexts/breadcrumb-context";
import { Home } from "lucide-react";

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const { customBreadcrumbs } = useBreadcrumb();

  // Si hay breadcrumbs personalizados, usarlos directamente
  if (customBreadcrumbs.length > 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          {/* Home siempre visible */}
          {/* <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1">
              <span className="hidden sm:inline">Dashboard</span>
            </BreadcrumbLink>
          </BreadcrumbItem> */}

          {customBreadcrumbs.map((crumb, index) => {
            const isLast = index === customBreadcrumbs.length - 1;

            return (
              <div key={index} className="flex items-center gap-2">
                <BreadcrumbItem>
                  {isLast || !crumb.href ? (
                    <BreadcrumbPage className="line-clamp-1 max-w-[200px]">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={crumb.href}
                      className="line-clamp-1 max-w-[200px]"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Generar breadcrumbs automáticamente desde el pathname
  const pathSegments = pathname.split("/").filter(Boolean);

  // Si estamos en home
  if (pathSegments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-1">
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Construir breadcrumbs desde pathname
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");

    // Buscar label en navLinks
    const navItem = navLinks.find((item) => item.href === href);
    const label = navItem?.title || formatSegment(segment);

    return { label, href };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home */}
        {/* <BreadcrumbItem>
          <BreadcrumbLink href="/" className="flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </BreadcrumbLink>
        </BreadcrumbItem> */}

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <div key={index} className="flex items-center gap-2">
              {/* <BreadcrumbSeparator /> */}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="line-clamp-1 max-w-[200px]">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={crumb.href}
                    className="line-clamp-1 max-w-[200px]"
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Helper para formatear segmentos de URL
function formatSegment(segment: string): string {
  // Si parece un ID (cuid), mostrar "[ID]"
  if (segment.match(/^[a-z0-9]{20,}$/i)) {
    return "Detalle";
  }

  // Capitalizar primera letra y reemplazar guiones
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
