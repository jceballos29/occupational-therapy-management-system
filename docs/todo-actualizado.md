# Plan de Acción - Sistema delt Gestión de Terapia Ocupacional

**Fecha:** 30 de Enero de 2026  
**Objetivo:** Completar la implementación del sistema para que sea 100% funcional

---

## 📊 Estado Actual

**Progreso General:** ~65%

### ✅ Completado
- [x] Base de datos (Schema Prisma excelente)
- [x] CRUD de Pacientes (completo con validaciones)
- [x] CRUD de Citas (con prevención de conflictos)
- [x] CRUD de Autorizaciones (con resolución automática)
- [x] Sistema de tipos TypeScript
- [x] Validaciones Zod
- [x] Componentes UI base (shadcn/ui)
- [x] Breadcrumbs dinámicos
- [x] Navegación centralizada
- [x] Sidebar moderna

### ❌ Pendiente
- [ ] Dashboard Principal (CRÍTICO)
- [ ] Sistema de Pagos (CRÍTICO)
- [ ] Gestión de Tarifas (MEDIO)
- [ ] Calendario Visual
- [ ] Módulo de Facturación/Reportes
- [ ] Búsqueda Global
- [ ] Autenticación

---

## 🚨 FASE 1: Funcionalidades Críticas (PRIORITARIAS)

### 1. Implementar Dashboard Principal ⏱️ 2-3 días

**Objetivo:** Home con resumen de operaciones diarias

#### Tareas

- [ ] **1.1** Crear queries de dashboard
  - [ ] `getDailyAppointments()` - Citas de hoy
  - [ ] `getMonthlyRevenue()` - Ingresos del mes
  - [ ] `getUpcomingAppointments()` - Próximas citas
  - [ ] `getExpiringAuthorizations()` - Autorizaciones por vencer
  
- [ ] **1.2** Crear widgets de dashboard
  - [ ] `revenue-widget.tsx` - Gráfico de ingresos (con recharts)
  - [ ] `agenda-widget.tsx` - Timeline de citas del día
  - [ ] `upcoming-widget.tsx` - Lista de próximas citas
  - [ ] `alerts-widget.tsx` - Alertas de autorizaciones/pagos
  
- [ ] **1.3** Implementar página principal
  - [ ] Layout responsive (grid 2x2 en desktop)
  - [ ] Loading states con Skeleton
  - [ ] Error boundaries

**Archivos a Crear:**
```
lib/queries/dashboard.ts
components/dashboard/revenue-widget.tsx
components/dashboard/agenda-widget.tsx
components/dashboard/upcoming-widget.tsx
components/dashboard/alerts-widget.tsx
app/(dashboard)/page.tsx
```

**Dependencias:**
```bash
pnpm add recharts
```

**Métricas de Éxito:**
- ✅ Dashboard muestra ingresos del mes actual
- ✅ Se visualizan citas de hoy
- ✅ Alertas de autorizaciones próximas a vencer
- ✅ Responsive en mobile y desktop

---

### 2. Sistema de Pagos Completo ⏱️ 3-4 días

**Objetivo:** Registrar y gestionar pagos de sesiones

#### Tareas

- [ ] **2.1** Crear schema de validación
  - [ ] `lib/schemas/payment.ts`
  - [ ] Validar `amount > 0`
  - [ ] Validar suma de pagos ≤ precio de cita
  - [ ] Validar métodos de pago permitidos
  
- [ ] **2.2** Crear Server Actions
  - [ ] `createPayment(appointmentId, amount, method, payer)`
  - [ ] `deletePayment(paymentId)` - Solo si cita está SCHEDULED
  - [ ] Validar que cita no esté CANCELLED antes de pagar
  
- [ ] **2.3** Crear queries
  - [ ] `getPaymentsByAppointment(appointmentId)`
  - [ ] `getPaymentsByPatient(patientId, dateRange?)`
  - [ ] `getPatientBalance(patientId)` - Calcular pendiente
  
- [ ] **2.4** Crear componentes UI
  - [ ] `add-payment-dialog.tsx` - Modal para registrar pago
  - [ ] `payment-list.tsx` - Tabla de pagos de una cita
  - [ ] `patient-balance-card.tsx` - Card con balance total
  
- [ ] **2.5** Integrar en vistas existentes
  - [ ] Agregar sección de pagos en `patients/[id]/page.tsx`
  - [ ] Mostrar pagos por cita en SectionAppointments
  - [ ] Badge de "Pagado/Pendiente" en tabla de citas

**Archivos a Crear:**
```
lib/schemas/payment.ts
lib/actions/payments.ts
lib/queries/payments.ts
components/payments/add-payment-dialog.tsx
components/payments/payment-list.tsx
components/payments/patient-balance-card.tsx
```

**Reglas de Negocio:**
- ✅ Permitir pagos parciales (múltiples pagos por cita)
- ✅ Calcular balance automáticamente
- ✅ Solo SCHEDULED y COMPLETED aceptan pagos
- ✅ Mostrar diferencia entre lo pagado y el total

**Métricas de Éxito:**
- ✅ Se pueden registrar pagos por cita
- ✅ Se visualiza historial de pagos por paciente
- ✅ Se calcula balance pendiente correctamente
- ✅ No se puede pagar más del total de la cita

---

### 3. Gestión de Tarifas con UI ⏱️ 2-3 días

**Objetivo:** CRUD de tarifas por aseguradora con auto-completado

#### Tareas

- [ ] **3.1** Crear schema de validación
  - [ ] `lib/schemas/tariff.ts`
  - [ ] Validar `costTotal = copayAmount + insurerAmount`
  - [ ] Validar montos > 0
  
- [ ] **3.2** Crear Server Actions
  - [ ] `createTariff(data)`
  - [ ] `updateTariff(id, data)`
  - [ ] `deleteTariff(id)` o `deactivateTariff(id)`
  - [ ] Validar que no haya duplicados (insurerId + type)
  
- [ ] **3.3** Crear queries
  - [ ] `getTariffsByInsurer(insurerId)`
  - [ ] `getActiveTariffs()`
  - [ ] `getTariffForPatient(patientId)` - Según su tipo y aseguradora
  
- [ ] **3.4** Crear componentes UI
  - [ ] `tariff-form.tsx` - Formulario de tarifa
  - [ ] `tariff-table.tsx` - Tabla con filtros por aseguradora
  - [ ] `add-tariff-dialog.tsx` - Modal para crear
  - [ ] `edit-tariff-dialog.tsx` - Modal para editar
  
- [ ] **3.5** Crear página de tarifas
  - [ ] `app/(dashboard)/tariffs/page.tsx`
  - [ ] Vista de tabla con todas las tarifas
  - [ ] Filtro por aseguradora
  - [ ] Botón de crear nueva tarifa
  
- [ ] **3.6** Integrar con formulario de citas
  - [ ] Modificar `add-appointment-modal.tsx`
  - [ ] Auto-completar precio al seleccionar paciente
  - [ ] Mostrar tarifa sugerida (permitir override)
  - [ ] Tooltip con explicación de la tarifa

**Archivos a Crear:**
```
lib/schemas/tariff.ts
lib/actions/tariffs.ts
lib/queries/tariffs.ts
components/tariffs/tariff-form.tsx
components/tariffs/tariff-table.tsx
components/tariffs/add-tariff-dialog.tsx
components/tariffs/edit-tariff-dialog.tsx
app/(dashboard)/tariffs/page.tsx
```

**Archivos a Modificar:**
```
config/nav.ts (agregar ítem "Tarifas")
components/appointments/add-appointment-modal.tsx (auto-completar precio)
components/appointments/edit-appointment-modal.tsx (mostrar tarifa)
```

**Métricas de Éxito:**
- ✅ Se pueden crear/editar tarifas por aseguradora
- ✅ Formulario de citas muestra tarifa sugerida
- ✅ Se calcula automáticamente copago + aseguradora
- ✅ Validación de que costTotal = suma de partes

---

## 🔧 FASE 2: Mejoras Importantes (SECUNDARIAS)

### 4. Calendario Visual de Citas ⏱️ 3-4 días

**Objetivo:** Vista de calendario interactiva

#### Tareas

- [ ] **4.1** Instalar dependencias
  ```bash
  pnpm add @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
  ```
  
- [ ] **4.2** Crear query de eventos
  - [ ] `getAppointmentsForCalendar(startDate, endDate)`
  - [ ] Convertir appointments a formato de FullCalendar
  
- [ ] **4.3** Crear componentes
  - [ ] `agenda-calendar.tsx` - Componente de calendario
  - [ ] Configurar vistas (mes, semana, día)
  - [ ] Códigos de color por doctor (usar `colorCode`)
  
- [ ] **4.4** Crear página
  - [ ] `app/(dashboard)/agenda/page.tsx`
  - [ ] Toolbar para cambiar vista
  - [ ] Click en evento → Ver detalle
  - [ ] Click en slot vacío → Crear cita
  
- [ ] **4.5** Funcionalidades extra (opcional)
  - [ ] Drag & drop para reagendar
  - [ ] Filtro por doctor
  - [ ] Tooltip con detalles al hover

**Archivos a Crear:**
```
lib/queries/calendar.ts
components/calendar/agenda-calendar.tsx
app/(dashboard)/agenda/page.tsx
```

**Métricas de Éxito:**
- ✅ Visualización de citas en calendario
- ✅ Códigos de color por doctor
- ✅ Click en cita abre detalle
- ✅ Responsive

---

### 5. Módulo de Facturación y Reportes ⏱️ 3-4 días

**Objetivo:** Generar reportes para contabilidad y facturación a EPS

#### Tareas

- [ ] **5.1** Instalar dependencias
  ```bash
  pnpm add xlsx jspdf jspdf-autotable
  ```
  
- [ ] **5.2** Crear queries de reportes
  - [ ] `getSessionsReport(filters)` - Sesiones por fecha/paciente/aseguradora
  - [ ] `getRevenueReport(startDate, endDate)` - Ingresos por período
  - [ ] `getDoctorReport(doctorId, dateRange)` - Sesiones por doctor
  - [ ] `getInsurerReport(insurerId, month)` - Para facturar a EPS
  
- [ ] **5.3** Crear utilidades de exportación
  - [ ] `exportToExcel(data, fileName)`
  - [ ] `exportToPDF(data, fileName, headers)`
  
- [ ] **5.4** Crear componentes
  - [ ] `report-filters.tsx` - Filtros de fechas/aseguradora/doctor
  - [ ] `report-table.tsx` - Tabla con los datos
  - [ ] `export-buttons.tsx` - Botones de Excel/PDF
  
- [ ] **5.5** Crear página
  - [ ] `app/(dashboard)/billing/page.tsx`
  - [ ] Tabs para diferentes tipos de reportes
  - [ ] Filtros dinámicos
  - [ ] Resumen de totales

**Archivos a Crear:**
```
lib/queries/reports.ts
lib/utils/export.ts
components/reports/report-filters.tsx
components/reports/report-table.tsx
components/reports/export-buttons.tsx
app/(dashboard)/billing/page.tsx
```

**Tipos de Reportes:**
1. **Sesiones por Paciente** (para facturar a EPS)
2. **Ingresos por Período** (contabilidad)
3. **Sesiones por Doctor** (productividad)
4. **Estado de Autorizaciones** (activas/vencidas)

**Métricas de Éxito:**
- ✅ Se pueden generar reportes por filtros
- ✅ Exportación a Excel funciona
- ✅ Exportación a PDF funciona
- ✅ Totales calculados correctamente

---

### 6. Búsqueda Avanzada Global ⏱️ 2 días

**Objetivo:** Búsqueda rápida con Cmd+K

#### Tareas

- [ ] **6.1** Crear queries de búsqueda
  - [ ] `searchPatients(query)` - Por nombre, documento, teléfono
  - [ ] `searchAppointments(query)` - Por fecha, estado
  
- [ ] **6.2** Crear componente de búsqueda
  - [ ] `search-command.tsx` usando `cmdk`
  - [ ] Atajo Cmd/Ctrl + K
  - [ ] Resultados agrupados (Pacientes, Citas)
  - [ ] Navegación con teclado
  
- [ ] **6.3** Integrar en layout
  - [ ] Agregar en `app/(dashboard)/layout.tsx`
  - [ ] Botón visible para usuarios que no conocen el atajo

**Archivos a Crear:**
```
lib/queries/search.ts
components/search-command.tsx
```

**Métricas de Éxito:**
- ✅ Cmd+K abre búsqueda
- ✅ Busca pacientes por múltiples campos
- ✅ Navegación rápida a resultados
- ✅ Cerrar con Esc

---

### 7. Fixes Menores Rápidos ⏱️ 1 día

- [ ] **Fix 1:** Agregar validación `validUntil > validFrom` en [lib/schemas/authorization.ts](file:///home/jceballos/Documentos/paola/occupational-therapy-management-system/lib/schemas/authorization.ts)
- [ ] **Fix 2:** Actualizar README con instrucciones de setup
- [ ] **Fix 3:** Crear `.env.example` con variables necesarias
- [ ] **Fix 4:** Mejorar mensajes de error en español
- [ ] **Fix 5:** Agregar loading states en todas las tablas
- [ ] **Fix 6:** Implementar paginación en tabla de pacientes

---

## 🌟 FASE 3: Mejoras Opcionales (FUTURO)

### 8. Autenticación con NextAuth.js ⏱️ 4-5 días

- [ ] Instalar NextAuth.js v5
- [ ] Configurar provider (Credentials)
- [ ] Crear páginas de login/logout
- [ ] Middleware de protección de rutas
- [ ] Implementar roles (ADMIN, DOCTOR, SECRETARY)
- [ ] Permisos basados en rol

---

### 9. Sistema de Notificaciones ⏱️ 5-6 días

- [ ] Recordatorios de citas por email (Resend/SendGrid)
- [ ] Recordatorios por WhatsApp (Twilio)
- [ ] Alertas de autorizaciones por vencer
- [ ] Queue de jobs con BullMQ o similar

---

### 10. Testing ⏱️ 5-7 días

- [ ] Configurar Jest + React Testing Library
- [ ] Tests unitarios de Server Actions
- [ ] Tests de componentes UI
- [ ] Tests E2E con Playwright
- [ ] Coverage mínimo del 70%

---

## 🗓️ Roadmap Sugerido

### **Semana 1: Críticos Parte 1**
- Lunes-Martes: Dashboard Principal
- Miércoles-Viernes: Sistema de Pagos (modelo, actions, queries)

### **Semana 2: Críticos Parte 2**
- Lunes-Martes: Sistema de Pagos (UI, integración)
- Miércoles-Viernes: Gestión de Tarifas

### **Semana 3: Importantes**
- Lunes-Miércoles: Calendario Visual
- Jueves-Viernes: Módulo de Facturación (setup, queries)

### **Semana 4: Completar Importantes**
- Lunes-Miércoles: Módulo de Facturación (exportación)
- Jueves: Búsqueda Global
- Viernes: Fixes Menores

### **Semana 5+: Opcionales**
- Autenticación
- Notificaciones
- Testing
- Optimizaciones

---

## 📋 Checklist de Verificación

Al completar cada módulo, verificar:

### Dashboard
- [ ] Se muestran métricas del día actual
- [ ] Gráficos se renderizan correctamente
- [ ] Alertas son útiles y accionables
- [ ] Responsive en mobile

### Pagos
- [ ] Se pueden registrar pagos
- [ ] Balance se calcula correctamente
- [ ] No se puede exceder precio de cita
- [ ] Historial completo por paciente

### Tarifas
- [ ] CRUD completo funciona
- [ ] Auto-completado en formulario de citas
- [ ] Validación de suma de partes
- [ ] Filtros por aseguradora

### Calendario
- [ ] Eventos se visualizan
- [ ] Códigos de color funcionan
- [ ] Click abre detalle
- [ ] Performance con muchos eventos

### Facturación
- [ ] Reportes se generan correctamente
- [ ] Exportaciones funcionan
- [ ] Filtros afectan resultados
- [ ] Totales son correctos

### Búsqueda
- [ ] Cmd+K funciona
- [ ] Resultados relevantes
- [ ] Navegación con teclado
- [ ] Performance con muchos registros

---

## 🎯 Métricas de Éxito del Proyecto

Al completar **Fase 1**, la aplicación debería:
- ✅ Mostrar dashboard con métricas diarias
- ✅ Permitir registro de pacientes, citas y autorizaciones
- ✅ Registrar y visualizar pagos
- ✅ Gestionar tarifas por aseguradora
- ✅ Cálculo automático de precios

Al completar **Fase 2**, la aplicación debería:
- ✅ Visualizar agenda en calendario
- ✅ Generar reportes para facturación
- ✅ Búsqueda rápida de registros
- ✅ Exportar datos a Excel/PDF

---

## 🚀 Inicio Rápido

### Para Empezar HOY:

1. **Dashboard Básico** (3-4 horas)
   - Crear página principal
   - Agregar un widget simple de estadísticas
   - Sustituir template por defecto

2. **Validación de Autorización** (30 min)
   - Agregar refine en schema

3. **README Actualizado** (1 hora)
   - Documentar setup del proyecto
   - Agregar instrucciones de instalación

### Para Esta Semana:

1. Completar Dashboard con todos los widgets
2. Implementar modelo básico de pagos
3. Crear UI de registro de pagos

---

## 📞 Notas Finales

- **Prioridad:** Dashboard y Pagos son CRÍTICOS
- **Tiempo Real:** Con dedicación full-time: 4-5 semanas
- **MVP:** Con Fase 1 completa ya tienes una app usable
- **Deuda Técnica:** Fase 3 puede esperar hasta tener usuarios reales

**¿Por dónde empezar?** 
👉 Dashboard Principal → da impacto visual inmediato  
👉 Sistema de Pagos → funcionalidad de negocio crítica

---

**Última Actualización:** 30 de Enero de 2026
