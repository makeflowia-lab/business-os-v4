# PRP-001: Integración de Sistema Financiero en Business Dashboard

> **Estado**: INVESTIGACION COMPLETADA - Pendiente aprobacion
> **Fecha**: 2024-12-12
> **Autor**: Claude Opus 4.5
> **Proyecto origen**: [tu-proyecto-financiero]
> **Proyecto destino**: business (clon de Profits OS)

---

## Objetivo

Extraer la funcionalidad clave del [tu-proyecto-financiero] e integrarla en el proyecto "business" para crear un **Centro de Control Financiero Unificado** que:

1. Registre transacciones reales (ingresos/gastos)
2. Gestione gastos recurrentes (mensuales y anuales)
3. Calcule metricas de salud financiera (ROI Calculator existente)
4. Proporcione un agente IA con contexto completo

---

## Por Que

| Problema Actual | Solucion Propuesta |
|-----------------|-------------------|
| ROI Calculator usa datos hipoteticos | Alimentar con transacciones reales |
| Sistema financiero sin proyecciones | Agregar calculadora de metricas |
| Dos sistemas separados | Un dashboard unificado |
| Agente sin contexto historico | Agente con acceso a datos reales + proyecciones |

**Valor de negocio**: Dashboard que no solo registra, sino que **predice y optimiza** decisiones financieras basado en datos reales.

---

## Que Extraer del Sistema Financiero

### COMPONENTES UI A MIGRAR

| Componente | Archivo Original | Proposito | Prioridad | Adaptaciones Necesarias |
|------------|-----------------|-----------|-----------|------------------------|
| **KPICard** | `components/KPICard.tsx` | Tarjetas de metricas (Ingresos, Gastos, Balance) | ALTA | Adaptar estilos a Neumorphism |
| **TrendChart** | `components/TrendChart.tsx` | Grafica de tendencias temporal | ALTA | Integrar con Chart.js, respetar tema |
| **DataViews** | `components/DataViews.tsx` | Tabla editable de transacciones | ALTA | 637 LOC - Simplificar si es necesario |
| **CategoryDistribution** | `components/CategoryDistribution.tsx` | Pie chart por categoria | MEDIA | Adaptar colores a paleta |
| **AddTransactionModal** | `components/AddTransactionModal.tsx` | Modal agregar ingreso/gasto | ALTA | Adaptar a NeuCard/NeuInput |
| **GastosRecurrentesAlert** | `components/GastosRecurrentesAlert.tsx` | Alerta gastos proximos | MEDIA | Integrar en dashboard |
| **ThemeToggle** | `components/ThemeToggle.tsx` | Cambio tema claro/oscuro | BAJA | Ya tenemos Neumorphism fijo |

### HOOKS A MIGRAR

| Hook | Archivo Original | Retorna | Prioridad |
|------|-----------------|---------|-----------|
| **useEnhancedChat** | `hooks/useEnhancedChat.ts` | messages, isLoading, sendMessage, stopGeneration | MEDIA | Ya tenemos useChat de AI SDK |
| **useNotifications** | `hooks/useNotifications.ts` | permission, subscribe, sendTestNotification | BAJA | PWA feature opcional |
| **useImageUpload** | `hooks/useImageUpload.ts` | uploadImage, isLoading, progress | MEDIA | Para OCR de tickets |

### API ROUTES A MIGRAR

| Endpoint | Metodo | Proposito | Tablas | Prioridad |
|----------|--------|-----------|--------|-----------|
| `/api/transacciones` | GET/PUT/DELETE | CRUD transacciones | transacciones | ALTA |
| `/api/gastos-mensuales` | GET/POST/PUT/DELETE | CRUD gastos mensuales | gastos_mensuales | ALTA |
| `/api/gastos-anuales` | GET/POST/PUT/DELETE | CRUD gastos anuales | gastos_anuales | MEDIA |
| `/api/upload-image` | POST | Upload tickets a Storage | storage/tickets | BAJA |

### PAGINAS A CREAR

| Ruta | Proposito | Componentes |
|------|-----------|-------------|
| `/finances` | Dashboard de transacciones | KPICard, TrendChart, DataViews |
| `/finances/recurring` | Gastos recurrentes | Tabla editable |
| `/finances/annual` | Gastos anuales | Tabla editable |

---

## Modelos de Datos (Migraciones Supabase)

### Tabla: `transacciones`
```sql
CREATE TABLE transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id), -- Agregar multi-tenancy
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
  categoria TEXT NOT NULL,
  descripcion TEXT,
  metodo_pago TEXT,
  registrado_por TEXT,
  foto_url TEXT,
  fecha_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transacciones_fecha ON transacciones(fecha_hora DESC);
CREATE INDEX idx_transacciones_tipo ON transacciones(tipo);
CREATE INDEX idx_transacciones_user ON transacciones(user_id);
```

### Tabla: `gastos_mensuales`
```sql
CREATE TABLE gastos_mensuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  nombre_app TEXT NOT NULL,
  categoria TEXT NOT NULL,
  dia_de_cobro INTEGER NOT NULL CHECK (dia_de_cobro BETWEEN 1 AND 31),
  monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gastos_mensuales_dia ON gastos_mensuales(dia_de_cobro);
CREATE INDEX idx_gastos_mensuales_activo ON gastos_mensuales(activo);
```

### Tabla: `gastos_anuales`
```sql
CREATE TABLE gastos_anuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  nombre_servicio TEXT NOT NULL,
  categoria TEXT DEFAULT 'Otros',
  mes_de_cobro INTEGER NOT NULL CHECK (mes_de_cobro BETWEEN 1 AND 12),
  dia_de_cobro INTEGER NOT NULL CHECK (dia_de_cobro BETWEEN 1 AND 31),
  monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gastos_anuales_mes ON gastos_anuales(mes_de_cobro);
```

---

## Categorias Predefinidas

### Gastos
```typescript
const EXPENSE_CATEGORIES = [
  'Nomina',
  'Renta',
  'Software',
  'Suscripciones',
  'Marketing',
  'Servicios',
  'Mantenimiento',
  'Transporte',
  'Comisiones',
  'Otros'
]
```

### Ingresos
```typescript
const INCOME_CATEGORIES = [
  'Ventas',
  'Servicios',
  'Consultoria',
  'Suscripciones',
  'Comisiones',
  'Otros'
]
```

---

## Arquitectura Propuesta (Feature-First)

```
src/features/
├── calculator/          # (EXISTENTE) ROI Calculator + Metricas
│   ├── components/
│   ├── services/
│   ├── store/
│   └── types/
│
├── finances/            # (NUEVO) Sistema Financiero
│   ├── components/
│   │   ├── KPICard.tsx
│   │   ├── TrendChart.tsx
│   │   ├── TransactionsTable.tsx
│   │   ├── AddTransactionModal.tsx
│   │   ├── CategoryDistribution.tsx
│   │   └── RecurringExpensesList.tsx
│   ├── hooks/
│   │   └── useTransactions.ts
│   ├── services/
│   │   ├── transactions.ts
│   │   ├── recurringExpenses.ts
│   │   └── analytics.ts
│   ├── store/
│   │   └── financesStore.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
│
├── dashboard/           # (EXISTENTE) Metricas Grid
│
└── agent/               # (EXISTENTE) Virtual CFO
    └── (Agregar contexto de transacciones al prompt)
```

---

## Integracion con ROI Calculator Existente

### Flujo de Datos Unificado

```
┌─────────────────────────────────────────────────────────────┐
│                    FUENTES DE DATOS                          │
├─────────────────────────────────────────────────────────────┤
│  Wizard (inputs manuales)     Transacciones (datos reales)  │
│         ↓                              ↓                     │
│  FinancialInputs              TransactionSummary             │
│         ↓                              ↓                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              CALCULATOR ENGINE                        │   │
│  │  - Usa datos del wizard SI no hay transacciones      │   │
│  │  - Usa datos reales SI hay transacciones             │   │
│  │  - Calcula las 10 metricas de rentabilidad           │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│                  CalculatedMetrics                           │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              VIRTUAL CFO AGENT                        │   │
│  │  Contexto = Metricas + Transacciones + Recurrentes   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Ejemplo de Contexto Enriquecido para el Agente

```typescript
function buildEnhancedContext(
  metrics: CalculatedMetrics,
  inputs: FinancialInputs,
  transactions: Transaction[],
  recurringExpenses: RecurringExpense[]
): string {
  return `
DATOS DEL NEGOCIO:
- Nombre: ${inputs.businessName}
- Industria: ${inputs.industry}

METRICAS CALCULADAS (ultimos 30 dias):
- Margen Neto: ${metrics.netProfitMargin.formattedValue}
- Punto de Equilibrio: ${metrics.breakEvenPoint.formattedValue}
- Runway: ${metrics.runwayDays.formattedValue}
...

TRANSACCIONES RECIENTES:
- Total Ingresos: $${sumByType(transactions, 'ingreso')}
- Total Gastos: $${sumByType(transactions, 'gasto')}
- Balance: $${balance}

TOP 3 CATEGORIAS DE GASTO:
${topCategories(transactions)}

GASTOS RECURRENTES ACTIVOS:
- Mensuales: $${totalMonthly} (${countMonthly} servicios)
- Anuales: $${totalAnnual} (${countAnnual} servicios)
- Proximo vencimiento: ${nextDue}

ALERTAS:
${generateAlerts(metrics, transactions, recurringExpenses)}
  `.trim()
}
```

---

## Fases de Implementacion (Blueprint)

### Fase 1: Infraestructura de Base de Datos
- [ ] Crear migracion `transacciones`
- [ ] Crear migracion `gastos_mensuales`
- [ ] Crear migracion `gastos_anuales`
- [ ] Configurar RLS policies
- [ ] Generar tipos TypeScript

### Fase 2: Feature Finances - Core
- [ ] Crear estructura `src/features/finances/`
- [ ] Migrar tipos de transacciones
- [ ] Crear API routes CRUD
- [ ] Crear store Zustand para transacciones
- [ ] Crear servicios de datos

### Fase 3: Feature Finances - UI
- [ ] Adaptar KPICard a Neumorphism
- [ ] Migrar TrendChart (Chart.js)
- [ ] Crear TransactionsTable (basado en DataViews)
- [ ] Crear AddTransactionModal
- [ ] Crear pagina `/finances`

### Fase 4: Gastos Recurrentes
- [ ] Crear componente RecurringExpensesList
- [ ] Crear pagina `/finances/recurring`
- [ ] Crear pagina `/finances/annual`
- [ ] Agregar alertas de vencimiento

### Fase 5: Integracion con Calculator
- [ ] Modificar calculatorStore para aceptar datos reales
- [ ] Crear servicio de agregacion de transacciones
- [ ] Actualizar engine de calculo

### Fase 6: Enriquecer Agente CFO
- [ ] Modificar buildContext para incluir transacciones
- [ ] Agregar resumen de gastos recurrentes
- [ ] Agregar alertas inteligentes
- [ ] Probar respuestas del agente

### Fase 7: Validacion E2E
- [ ] Testing del flujo completo
- [ ] Validacion visual con Playwright
- [ ] Fix de errores

---

## Criterios de Exito

- [ ] Usuario puede registrar transacciones (ingresos/gastos)
- [ ] Usuario puede ver graficas de tendencias
- [ ] Usuario puede gestionar gastos recurrentes
- [ ] Las metricas del ROI Calculator se alimentan de datos reales
- [ ] El agente CFO tiene contexto de transacciones y recurrentes
- [ ] El dashboard muestra KPIs en tiempo real
- [ ] Los datos persisten en Supabase

---

## Dependencias a Instalar

```bash
npm install chart.js react-chartjs-2
```

---

## Gotchas Conocidos

1. **Chart.js + SSR**: Usar `dynamic(() => import(...), { ssr: false })`
2. **Decimal precision**: Usar `DECIMAL(10,2)` en Postgres, no FLOAT
3. **Timezone**: Siempre usar `TIMESTAMPTZ` para fechas
4. **Optimistic updates**: Actualizar UI antes de confirmar en BD
5. **RLS**: Habilitar en produccion, deshabilitar en desarrollo

---

## Anti-Patrones a Evitar

- NO crear nuevos patrones si los de Profits OS funcionan
- NO duplicar logica de calculo (usar calculatorStore)
- NO hardcodear categorias (usar constantes)
- NO ignorar errores de BD (mostrar feedback al usuario)
- NO mezclar estilos Glassmorphism con Neumorphism

---

## Referencias

- **Proyecto origen**: `./[proyecto-fuente]`
- **Proyecto destino**: `./[proyecto-destino]`
- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind + Supabase

---

*Este PRP es el resultado de investigacion profunda. No se ha modificado codigo todavia.*
