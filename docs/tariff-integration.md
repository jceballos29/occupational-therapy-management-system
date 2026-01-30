# Integración de Tarifas en el Modal de Citas

## 📋 Resumen de Cambios

Se implementó la funcionalidad para incluir tarifas en el proceso de creación de citas, permitiendo el auto-completado de precios según la aseguradora del paciente.

---

## ✅ Cambios Realizados

### 1. **Serialización de Tarifas en Query de Paciente**

**Archivo:** [`lib/queries/patients.ts`](file:///home/jceballos/Documentos/paola/occupational-therapy-management-system/lib/queries/patients.ts)

**Problema Resuelto:** Los objetos `Decimal` de Prisma no son serializables para Client Components de React.

**Solución:** Convertir los campos `Decimal` (costTotal, copayAmount, insurerAmount) a números:

```typescript
insurer: patient.insurer ? {
  ...patient.insurer,
  tariffs: patient.insurer.tariffs?.map(tariff => ({
    ...tariff,
    costTotal: Number(tariff.costTotal),
    copayAmount: Number(tariff.copayAmount),
    insurerAmount: Number(tariff.insurerAmount),
  })) || []
} : null,
```

---

### 2. **Actualización de Tipos TypeScript**

**Archivo:** [`types/patient.ts`](file:///home/jceballos/Documentos/paola/occupational-therapy-management-system/types/patient.ts)

**Nuevo tipo agregado:**

```typescript
export type SerializedTariff = {
  id: string;
  name: string;
  insurerId: string | null;
  costTotal: number;
  copayAmount: number;
  insurerAmount: number;
  active: boolean;
};
```

**Tipo actualizado:**

```typescript
export type PatientWithFullRelations = Omit<Patient, "appointments"> & {
  insurer:
    | (Insurer & {
        id: string;
        name: string;
        tariffs?: SerializedTariff[]; // ✅ Nuevo
      })
    | null;
  // ...
};
```

---

### 3. **Modificación del Modal de Citas**

**Archivo:** [`components/appointments/add-appointment-modal.tsx`](file:///home/jceballos/Documentos/paola/occupational-therapy-management-system/components/appointments/add-appointment-modal.tsx)

**Nuevas props:**

```typescript
interface AddAppointmentModalProps {
  patientId: string;
  patientType: PatientType;
  doctors: { id: string; firstName: string; lastName: string }[];
  tariffs?: SerializedTariff[]; // ✅ Nuevo
}
```

**Lógica de auto-completado:**

```typescript
// Filtrar solo tarifas activas
const activeTariffs = tariffs?.filter(t => t.active) || []

// Si solo hay una tarifa, usar sus valores por defecto
const defaultTariff = activeTariffs.length === 1 ? activeTariffs[0] : null

// Valores por defecto del formulario
defaultValues: {
  // ...
  price: defaultTariff?.costTotal || 0,
  copayAmount: defaultTariff?.copayAmount || 0,
}
```

**UI mejorada:**

- **Una sola tarifa:** Muestra mensaje "Tarifa predeterminada: [Nombre]" y pre-llena los campos
- **Múltiples tarifas:** Muestra dropdown para seleccionar tarifa, actualiza precios automáticamente
- **Sin tarifas:** Funciona como antes (valores manuales)

---

### 4. **Actualización del Componente SectionAppointments**

**Archivo:** [`components/patients/section-appointments.tsx`](file:///home/jceballos/Documentos/paola/occupational-therapy-management-system/components/patients/section-appointments.tsx)

**Cambio:**

```typescript
<AddAppointmentModal
  patientId={patient.id}
  patientType={patient.type}
  doctors={doctors}
  tariffs={patient.insurer?.tariffs || []} // ✅ Nuevo
/>
```

---

## 🎯 Funcionalidad Resultante

### Caso 1: Paciente con una sola tarifa activa

1. Se abre el modal de "Agendar Cita"
2. Se muestra: "Tarifa predeterminada: [Nombre de la tarifa]"
3. Los campos `Valor` y `Copago Paciente` se prellenan automáticamente
4. El usuario puede modificar los valores si es necesario

### Caso 2: Paciente con múltiples tarifas activas

1. Se abre el modal de "Agendar Cita"
2. Aparece un dropdown "Tarifa" con las opciones disponibles
3. Formato: "[Nombre] - $[Precio total]"
4. Al seleccionar una tarifa, se actualizan automáticamente:
   - Campo `Valor` → `costTotal`
   - Campo `Copago Paciente` → `copayAmount`

### Caso 3: Paciente sin tarifas (particular o sin configurar)

1. Funciona como antes
2. El usuario ingresa manualmente el precio y copago

---

## ✨ Beneficios

✅ **Menos errores:** El precio se autocompleta según la configuración de la aseguradora  
✅ **Más rapidez:** No es necesario recordar o buscar el precio de cada aseguradora  
✅ **Flexibilidad:** El usuario puede modificar los valores si es necesario (casos especiales)  
✅ **UX mejorada:** Indicador visual de qué tarifa se está usando

---

## 📝 Próximos Pasos Sugeridos

1. **Crear módulo de gestión de tarifas** (referencia: [`docs/todo-list.md`](file:///home/jceballos/Documentos/paola/occupational-therapy-management-system/docs/todo-list.md))
   - CRUD completo de tarifas
   - Asociación a aseguradoras
   - Histórico de cambios

2. **Validaciones adicionales:**
   - Alertar si el copago > precio total
   - Sugerir actualizar tarifas si están desactualizadas

3. **Auditoría:**
   - Log cuando se modifica una tarifa predeterminada
   - Reporte de citas con precios manuales vs automáticos

---

## 🐛 Problemas Conocidos

❌ Ninguno por el momento

---

## 🧪 Testing Sugerido

Para verificar que todo funciona correctamente:

1. **Test 1 - Tarifa única:**
   - Crear/editar un paciente con aseguradora que tenga solo 1 tarifa activa
   - Abrir modal de nueva cita
   - Verificar que precio y copago se prellenan
2. **Test 2 - Múltiples tarifas:**
   - Crear/editar un paciente con aseguradora que tenga 2+ tarifas activas
   - Abrir modal de nueva cita
   - Verificar que aparece dropdown de tarifas
   - Seleccionar diferentes tarifas y verificar que precios cambian

3. **Test 3 - Sin tarifas:**
   - Crear paciente particular (sin aseguradora)
   - Verificar que campos quedan en 0 y se pueden editar manualmente

---

## 📚 Archivos Modificados

1. [`lib/queries/patients.ts`](file:///home/jceballos/Documentos/paola/occupational-therapy-management-system/lib/queries/patients.ts) - Serialización de Decimales
2. [`types/patient.ts`](file:///home/jceballos/Documentos/paola/occupational-therapy-management-system/types/patient.ts) - Tipo `SerializedTariff`
3. [`components/appointments/add-appointment-modal.tsx`](file:///home/jceballos/Documentos/paola/occupational-therapy-management-system/components/appointments/add-appointment-modal.tsx) - Lógica de auto-completado
4. [`components/patients/section-appointments.tsx`](file:///home/jceballos/Documentos/paola/occupational-therapy-management-system/components/patients/section-appointments.tsx) - Pasar tarifas al modal
