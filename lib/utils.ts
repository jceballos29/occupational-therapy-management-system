import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como pesos colombianos (COP)
 * @param value - El valor numérico a formatear
 * @returns String formateado como "$ 1.234.567" o "$ 0" si el valor es inválido
 * @example
 * formatCOP(1234567) // "$ 1.234.567"
 * formatCOP(500) // "$ 500"
 */
export function formatCOP(value: number | string | null | undefined): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (numValue == null || isNaN(numValue)) {
    return "$ 0";
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}
