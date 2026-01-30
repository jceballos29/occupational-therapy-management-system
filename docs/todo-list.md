# Plan de Acción - Sistema de Gestión de Terapia Ocupacional

## 🎯 Objetivo

Completar la implementación del sistema de gestión de consultorios de terapia ocupacional, priorizando las funcionalidades críticas para que la aplicación sea completamente operativa.

---

## 📊 Estado Actual del Proyecto

**Progreso General:** ~60% completado

### ✅ Módulos Completados

- [x] Gestión de Pacientes (CRUD completo)
- [x] Gestión de Citas/Sesiones (CRUD completo)
- [x] Gestión de Autorizaciones (CRUD completo)
- [x] Base de datos (Schema Prisma completo)
- [x] Sistema de tipos TypeScript
- [x] Validaciones con Zod
- [x] Componentes UI base (shadcn/ui)

### ❌ Módulos Pendientes

- [ ] Dashboard Principal
- [ ] Sistema de Pagos
- [ ] Gestión de Tarifas
- [ ] Reportes y Exportación
- [ ] Calendario Visual
- [ ] Notificaciones

---

## 🚨 Fase 1: Funcionalidades Críticas (Prioridad Alta)

### 1. Implementar Dashboard Principal

**Archivo:** `app/(dashboard)/page.tsx`

**Objetivo:** Crear el home con resumen de operaciones diarias.

**Tareas:**

- [ ] **1.1** Crear componentes de widgets de dashboard
  - [ ] Widget de ingresos del mes (con gráfico)
  - [ ] Widget de agenda del día
  - [ ] Widget de próximas citas
  - [ ] Widget de alertas (autorizaciones por vencer)
- [ ] **1.2** Crear queries necesarias en `lib/queries/dashboard.ts`

  ```typescript
  -getDailyAppointments() -
    getMonthlyRevenue() -
    getUpcomingAppointments() -
    getExpiringAuthorizations();
  ```

- [ ] **1.3** Implementar la página principal del dashboard
  - [ ] Layout responsive (grid 2x2 en desktop, stack en mobile)
  - [ ] Loading states con Skeleton
  - [ ] Error boundaries

**Tiempo Estimado:** 2-3 días  
**Archivos a Crear:**

- `app/(dashboard)/page.tsx`
- `lib/queries/dashboard.ts`
- `components/dashboard/revenue-widget.tsx`
- `components/dashboard/agenda-widget.tsx`
- `components/dashboard/upcoming-appointments-widget.tsx`
- `components/dashboard/alerts-widget.tsx`

---

### 2. Implementar Sistema de Pagos Completo

**Objetivo:** Permitir registrar, visualizar y gestionar pagos de sesiones.

**Tareas:**

- [ ] **2.1** Crear Server Actions de pagos
  - [ ] `createPayment(appointmentId, amount, method, payer)` en `lib/actions/payments.ts`
  - [ ] `getPaymentsByAppointment(appointmentId)`
  - [ ] `getPaymentsByPatient(patientId, dateRange?)`
  - [ ] `deletePayment(paymentId)` (solo si cita está SCHEDULED)

- [ ] **2.2** Crear schema de validación
  - [ ] `lib/schemas/payment.ts` con validación Zod
  - [ ] Validar que amount > 0
  - [ ] Validar que suma de pagos no exceda precio de cita

- [ ] **2.3** Crear componentes UI de pagos
  - [ ] `components/payments/add-payment-dialog.tsx`
  - [ ] `components/payments/payment-list.tsx` (tabla de pagos por cita)
  - [ ] `components/payments/patient-balance-card.tsx` (balance por paciente)

- [ ] **2.4** Integrar en vista de paciente
  - [ ] Agregar sección de pagos en `app/(dashboard)/patients/[id]/page.tsx`
  - [ ] Mostrar pagos realizados por cita
  - [ ] Mostrar balance total del paciente

- [ ] **2.5** Reglas de negocio
  - [ ] Validar que una cita CANCELLED o NO_SHOW no acepte pagos
  - [ ] Permitir pagos parciales (múltiples pagos por cita)
  - [ ] Calcular balance pendiente automáticamente

**Tiempo Estimado:** 3-4 días  
**Archivos a Crear:**

- `lib/actions/payments.ts`
- `lib/schemas/payment.ts`
- `lib/queries/payments.ts`
- `components/payments/add-payment-dialog.tsx`
- `components/payments/payment-list.tsx`
- `components/payments/patient-balance-card.tsx`

---

### 3. Sistema de Gestión de Tarifas

**Objetivo:** Definir tarifas por aseguradora y auto-completar precios en citas.

**Tareas:**

- [ ] **3.1** Crear página de tarifas
  - [ ] `app/(dashboard)/tariffs/page.tsx` (tabla de tarifas)
  - [ ] Filtrar por aseguradora
  - [ ] CRUD completo (crear, editar, activar/desactivar)

- [ ] **3.2** Crear Server Actions
  - [ ] `createTariff()` en `lib/actions/tariffs.ts`
  - [ ] `updateTariff(id, data)`
  - [ ] `getTariffsByInsurer(insurerId)`
  - [ ] `getActiveTariffs()`

- [ ] **3.3** Crear schema de validación
  - [ ] `lib/schemas/tariff.ts`
  - [ ] Validar que costTotal = copayAmount + insurerAmount

- [ ] **3.4** Integrar en formulario de citas
  - [ ] Auto-completar precio cuando se selecciona aseguradora del paciente
  - [ ] Mostrar tarifa sugerida (permitir override manual)

- [ ] **3.5** Agregar a Sidebar
  - [ ] Ítem de menú "Tarifas" en `components/app-sidebar.tsx`

**Tiempo Estimado:** 2-3 días  
**Archivos a Crear:**

- `app/(dashboard)/tariffs/page.tsx`
- `lib/actions/tariffs.ts`
- `lib/schemas/tariff.ts`
- `lib/queries/tariffs.ts`
- `components/tariffs/tariff-form.tsx`
- `components/tariffs/tariff-table.tsx`

---

## 🔧 Fase 2: Mejoras Importantes (Prioridad Media)

### 4. Calendario Visual de Citas

**Objetivo:** Vista de calendario para agendar y visualizar citas.

**Tareas:**

- [ ] **4.1** Instalar librería de calendario

  ```bash
  pnpm add @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
  ```

- [ ] **4.2** Crear página de calendario
  - [ ] `app/(dashboard)/calendar/page.tsx`
  - [ ] Vista mensual, semanal y diaria
  - [ ] Códigos de color por doctor

- [ ] **4.3** Funcionalidades interactivas
  - [ ] Click en slot de tiempo → Abrir modal de nueva cita
  - [ ] Drag & drop para reagendar (opcional)
  - [ ] Tooltip con detalles de cita al hover

- [ ] **4.4** Sincronizar con datos de citas
  - [ ] Crear query `getAppointmentsForCalendar(startDate, endDate)`
  - [ ] Convertir appointments a eventos de FullCalendar

**Tiempo Estimado:** 3-4 días  
**Archivos a Crear:**

- `app/(dashboard)/calendar/page.tsx`
- `components/calendar/agenda-calendar.tsx`
- `lib/queries/appointments.ts` (extender)

---

### 5. Sistema de Reportes y Exportación

**Objetivo:** Generar reportes para contabilidad y facturación a aseguradoras.

**Tareas:**

- [ ] **5.1** Crear página de reportes
  - [ ] `app/(dashboard)/reports/page.tsx`
  - [ ] Filtros: rango de fechas, aseguradora, doctor, paciente

- [ ] **5.2** Tipos de reportes
  - [ ] Reporte de sesiones por paciente (para facturar a EPS)
  - [ ] Reporte de ingresos por período
  - [ ] Reporte de sesiones por doctor
  - [ ] Reporte de autorizaciones activas/vencidas

- [ ] **5.3** Exportación
  - [ ] Botón "Exportar a Excel" usando `xlsx` library
  - [ ] Botón "Exportar a PDF" usando `jsPDF`
  - [ ] Formato profesional con logo y datos del consultorio

- [ ] **5.4** Queries necesarias
  - [ ] `getSessionsReport(filters)`
  - [ ] `getRevenueReport(startDate, endDate)`
  - [ ] `getDoctorReport(doctorId, dateRange)`

**Tiempo Estimado:** 3-4 días  
**Archivos a Crear:**

- `app/(dashboard)/reports/page.tsx`
- `lib/queries/reports.ts`
- `lib/utils/export.ts` (helpers para exportar)
- `components/reports/report-filters.tsx`
- `components/reports/report-table.tsx`

**Librerías a Instalar:**

```bash
pnpm add xlsx jspdf jspdf-autotable
```

---

### 6. Búsqueda Avanzada

**Objetivo:** Facilitar búsqueda rápida de pacientes y citas.

**Tareas:**

- [ ] **6.1** Crear componente de búsqueda global
  - [ ] `components/search-command.tsx` usando `cmdk` (ya incluido en shadcn)
  - [ ] Atajo de teclado (Cmd/Ctrl + K)

- [ ] **6.2** Búsqueda de pacientes
  - [ ] Por nombre, apellido, documento, teléfono
  - [ ] Navegación rápida al perfil

- [ ] **6.3** Búsqueda de citas
  - [ ] Por fecha, estado, doctor
  - [ ] Navegación al paciente de la cita

- [ ] **6.4** Queries de búsqueda
  - [ ] `searchPatients(query)`
  - [ ] `searchAppointments(query)`

**Tiempo Estimado:** 2 días  
**Archivos a Crear:**

- `components/search-command.tsx`
- `lib/queries/search.ts`

---

### 7. Fix Breadcrumbs Dinámicos

**Objetivo:** Breadcrumbs que reflejen la navegación real.

**Tareas:**

- [ ] **7.1** Crear hook `useCurrentPath()`
  - [ ] `hooks/use-current-path.ts`
  - [ ] Parsear pathname actual

- [ ] **7.2** Actualizar `app/(dashboard)/layout.tsx`
  - [ ] Generar breadcrumbs basados en ruta
  - [ ] Mapear rutas a nombres legibles:
    ```typescript
    /patients → "Pacientes"
    /patients/[id] → "Pacientes / [Nombre Paciente]"
    /calendar → "Calendario"
    ```

**Tiempo Estimado:** 1 día  
**Archivos a Modificar:**

- `app/(dashboard)/layout.tsx`
- `hooks/use-current-path.ts` (nuevo)

---

## 🌟 Fase 3: Mejoras Opcionales (Prioridad Baja)

### 8. Autenticación y Roles

**Tareas:**

- [ ] Instalar NextAuth.js v5
- [ ] Crear modelos de Session en Prisma
- [ ] Implementar login/logout
- [ ] Middleware de protección de rutas
- [ ] Sistema de permisos basado en UserRole

**Tiempo Estimado:** 4-5 días

---

### 9. Sistema de Notificaciones

**Tareas:**

- [ ] Recordatorios por email (usando Resend/SendGrid)
- [ ] Recordatorios por WhatsApp (usando Twilio)
- [ ] Alertas internas (autorizaciones por vencer)
- [ ] Queue de jobs con BullMQ

**Tiempo Estimado:** 5-6 días

---

### 10. Testing

**Tareas:**

- [ ] Configurar Jest + React Testing Library
- [ ] Tests unitarios de server actions
- [ ] Tests de componentes
- [ ] Tests E2E con Playwright

**Tiempo Estimado:** 5-7 días

---

### 11. Optimizaciones

**Tareas:**

- [ ] Implementar ISR para páginas estáticas
- [ ] Lazy loading de componentes grandes
- [ ] Optimización de imágenes
- [ ] Caché con Prisma Accelerate (ya configurado)

**Tiempo Estimado:** 2-3 días

---

## 📋 Checklist Rápido de Fixes Menores

Estos son cambios rápidos que se pueden hacer en paralelo:

- [ ] **Fix 1:** Agregar validación `validUntil > validFrom` en `lib/schemas/authorization.ts`
- [ ] **Fix 2:** Rotar credenciales de Prisma Accelerate en `.env`
- [ ] **Fix 3:** Agregar `.env` a `.gitignore` si no está
- [ ] **Fix 4:** Actualizar README con instrucciones de setup del proyecto
- [ ] **Fix 5:** Agregar variables de entorno de ejemplo en `.env.example`
- [ ] **Fix 6:** Mejorar mensajes de error en español en todas las actions
- [ ] **Fix 7:** Agregar loading states en todas las tablas
- [ ] **Fix 8:** Implementar paginación en tabla de pacientes (actualmente carga todos)

**Tiempo Total:** 1 día

---

## 🗓️ Roadmap Sugerido

### **Semana 1-2: Funcionalidades Críticas**

1. Dashboard Principal (Días 1-3)
2. Sistema de Pagos (Días 4-7)
3. Gestión de Tarifas (Días 8-10)

### **Semana 3-4: Mejoras Importantes**

4. Calendario Visual (Días 11-14)
5. Reportes y Exportación (Días 15-18)
6. Búsqueda Avanzada + Breadcrumbs (Días 19-20)

### **Semana 5+: Opcionales**

7. Autenticación
8. Notificaciones
9. Testing
10. Optimizaciones

---

## 🔍 Métricas de Éxito

Al completar la **Fase 1**, la aplicación debería:

- ✅ Permitir registro completo de pacientes
- ✅ Agendar y gestionar citas
- ✅ Registrar pagos de sesiones
- ✅ Visualizar resumen diario de operaciones
- ✅ Auto-completar precios según tarifas
- ✅ Gestionar autorizaciones de aseguradoras

Al completar la **Fase 2**, la aplicación debería:

- ✅ Tener calendario visual interactivo
- ✅ Generar reportes para facturación
- ✅ Búsqueda rápida de registros
- ✅ Navegación mejorada con breadcrumbs

---

## 🚀 Inicio Rápido para Empezar

Si quieres comenzar **HOY**, te recomiendo este orden:

1. **Fix rápido de breadcrumbs** (2 horas)
2. **Dashboard básico** con estadísticas mínimas (1 día)
3. **Modal de pagos** en vista de paciente (1 día)
4. **Gestión de tarifas** básica (2 días)

Con esto tendrás las funcionalidades mínimas para empezar a usar el sistema en producción.

---

## 📞 Próximos Pasos

1. Revisar este plan y ajustar prioridades según necesidades del consultorio
2. Decidir qué fase implementar primero
3. Crear branches de Git para cada funcionalidad
4. Implementar con metodología iterativa (entregar módulo por módulo)

¿Por dónde quieres que empecemos? 🎯
