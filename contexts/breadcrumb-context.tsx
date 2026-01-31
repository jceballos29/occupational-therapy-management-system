"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Tipo para un item de breadcrumb personalizado
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbContextType {
  customBreadcrumbs: BreadcrumbItem[];
  setCustomBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  clearBreadcrumbs: () => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined,
);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState<BreadcrumbItem[]>(
    [],
  );

  const clearBreadcrumbs = () => setCustomBreadcrumbs([]);

  return (
    <BreadcrumbContext.Provider
      value={{ customBreadcrumbs, setCustomBreadcrumbs, clearBreadcrumbs }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
  }
  return context;
}
