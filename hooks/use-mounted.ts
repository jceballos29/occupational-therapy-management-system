"use client";

import { useEffect, useState } from "react";

/**
 * Hook para prevenir errores de hidratación
 * Retorna false durante SSR y true después de montar en el cliente
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
