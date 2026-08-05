# PRP-004: Dashboard con Filtros de Fecha (Historico/Mensual/Personalizado)

> **Estado**: PENDIENTE APROBACION
> **Fecha**: 2026-01-06
> **Autor**: Claude Opus 4.5
> **Proyecto**: finanzas-os

---

## Objetivo

Agregar selector de rango de fechas al Dashboard para ver datos **historicos (todo)**, **mensuales**, o **personalizados**. Todos los KPIs, graficas y tablas deben adaptarse al rango seleccionado.

---

## Por Que

| Problema Actual | Solucion Propuesta |
|-----------------|-------------------|
| Dashboard solo muestra mes actual | Selector de rango visible con 3 opciones |
| Ingresos/Gastos filtrados pero Balance es total | Todos los KPIs respetan el rango seleccionado |
| No hay forma de ver historico completo | Opcion "Historico" muestra TODO |
| Usuario confundido sobre que periodo ve | Etiqueta clara "Enero 2026" o "Todo el tiempo" |

**Valor de negocio**: El usuario puede analizar tendencias historicas, comparar meses, y entender su situacion financiera real en cualquier periodo.

---

## Que

### Comportamiento Esperado

1. **Selector de rango** visible en header del Dashboard con 3 opciones:
   - **Historico**: Todas las transacciones desde el inicio
   - **Mensual**: Mes actual (comportamiento actual)
   - **Personalizado**: Date picker para elegir rango

2. **KPIs adaptados al rango**:
   - Ingresos del periodo
   - Gastos del periodo
   - Balance del periodo (Ingresos - Gastos)
   - # Transacciones del periodo

3. **Grafica de tendencias** muestra datos del periodo seleccionado

4. **Tabla de transacciones** filtrada por periodo

5. **Etiqueta de contexto** que indica que periodo se esta viendo:
   - "Todo el tiempo" | "Enero 2026" | "15 Dic - 6 Ene"

### Criterios de Exito
- [ ] Usuario puede cambiar entre Historico/Mensual/Personalizado
- [ ] KPIs reflejan correctamente el periodo seleccionado
- [ ] Grafica muestra tendencias del periodo
- [ ] Tabla filtra transacciones del periodo
- [ ] Etiqueta indica claramente que periodo se ve
- [ ] Seleccion persiste al recargar (localStorage)

---

## Contexto Necesario

### Documentacion & Referencias
```yaml
# LECTURA OBLIGATORIA
- file: src/app/page.tsx
  why: Dashboard principal - donde agregar el selector

- file: src/features/finances/store/financesStore.ts
  why: Store con vista actual (ya existe VistaRango)

- file: src/features/finances/services/transactions.ts
  why: fetchTransactions ya soporta rangos

- file: src/features/finances/types/index.ts
  why: VistaRango type existente
```

### Arquitectura Actual
```
src/features/finances/
├── components/
│   ├── FinanceKPI.tsx        # KPI cards (no necesita cambios)
│   ├── TrendChart.tsx        # Grafica (recibe transactions)
│   ├── TransactionsTable.tsx # Tabla (recibe transactions)
│   └── CategoryDistribution.tsx
├── services/
│   └── transactions.ts       # fetchTransactions(vista, start?, end?)
├── store/
│   └── financesStore.ts      # vista: VistaRango, setVista()
└── types/
    └── index.ts              # VistaRango = 'diaria' | 'semanal' | 'mensual' | 'personalizada'
```

### Estado Actual del Codigo

**VistaRango actual** (types/index.ts):
```typescript
export type VistaRango = 'diaria' | 'semanal' | 'mensual' | 'personalizada'
```

**fetchTransactions actual** (transactions.ts):
```typescript
export async function fetchTransactions(
  vista: VistaRango = 'mensual',
  customStart?: Date,
  customEnd?: Date
): Promise<Transaction[]>
```

**Store actual** (financesStore.ts):
```typescript
vista: 'mensual', // Default
setVista: (vista) => set({ vista }),
```

**Problema**: No hay UI para cambiar la vista. Siempre usa 'mensual'.

---

## Arquitectura Propuesta

### Cambios en Types
```typescript
// types/index.ts - MODIFICAR
export type VistaRango = 'historico' | 'mensual' | 'personalizada'
// Removemos 'diaria' y 'semanal' - no se usan
```

### Nuevo Componente
```
src/features/finances/components/
└── DateRangeSelector.tsx  # NUEVO - Selector de rango
```

### Cambios en Store
```typescript
// financesStore.ts - AGREGAR
customDateRange: { start: Date | null, end: Date | null }
setCustomDateRange: (start: Date | null, end: Date | null) => void
```

### Cambios en Service
```typescript
// transactions.ts - MODIFICAR getDateRange()
case 'historico':
  start.setFullYear(2020) // Fecha muy antigua para traer todo
  break
```

---

## Blueprint de Implementacion

### Fase 1: Actualizar Types y Store
**Objetivo**: Preparar el estado para soportar nuevos rangos

- [ ] Modificar `VistaRango` en types/index.ts (agregar 'historico')
- [ ] Agregar `customDateRange` al store
- [ ] Agregar `setCustomDateRange` action
- [ ] Persistir vista y customDateRange en localStorage

**Archivos a modificar**:
- `src/features/finances/types/index.ts`
- `src/features/finances/store/financesStore.ts`

**Validacion**: TypeScript compila sin errores

---

### Fase 2: Actualizar Service de Transacciones
**Objetivo**: fetchTransactions soporta 'historico'

- [ ] Modificar `getDateRange()` para manejar 'historico'
- [ ] Para 'historico': start = 2020-01-01, end = now

**Archivo a modificar**:
- `src/features/finances/services/transactions.ts`

**Validacion**: `fetchTransactions('historico')` retorna todas las transacciones

---

### Fase 3: Crear Componente DateRangeSelector
**Objetivo**: UI para seleccionar rango de fechas

- [ ] Crear `DateRangeSelector.tsx` con:
  - 3 botones: Historico | Mensual | Personalizado
  - Date pickers (solo visibles en modo Personalizado)
  - Etiqueta de contexto ("Todo" | "Enero 2026" | "15 Dic - 6 Ene")
- [ ] Estilo Neumorphic consistente con el resto de la app

**Archivo a crear**:
- `src/features/finances/components/DateRangeSelector.tsx`

**Props**:
```typescript
interface DateRangeSelectorProps {
  vista: VistaRango
  customRange: { start: Date | null, end: Date | null }
  onVistaChange: (vista: VistaRango) => void
  onCustomRangeChange: (start: Date, end: Date) => void
}
```

**Validacion**: Componente renderiza correctamente en Storybook o prueba manual

---

### Fase 4: Integrar en Dashboard
**Objetivo**: Dashboard usa el selector y respeta la vista

- [ ] Importar DateRangeSelector en page.tsx
- [ ] Colocar debajo del header
- [ ] Conectar con store (vista, setVista, customDateRange, setCustomDateRange)
- [ ] Pasar vista a fetchTransactions
- [ ] Recalcular KPIs cuando cambia la vista

**Archivo a modificar**:
- `src/app/page.tsx`

**Validacion**: Cambiar vista actualiza todos los datos

---

### Fase 5: Ajustar Balance en KPIs
**Objetivo**: Balance muestra periodo, no total de cuentas

- [ ] Modificar logica en page.tsx para que Balance sea del periodo
- [ ] Balance = Ingresos del periodo - Gastos del periodo
- [ ] Remover calculo de balanceTotal (era confuso)
- [ ] O agregar KPI adicional "Patrimonio Total" si se quiere mostrar ambos

**Decision requerida**: ¿Mostrar solo Balance del periodo o ambos (Balance periodo + Patrimonio total)?

**Validacion**: Balance coincide con Ingresos - Gastos del periodo

---

### Fase 6: Validacion E2E
**Objetivo**: Todo funciona correctamente

- [ ] Verificar TypeScript: `npx tsc --noEmit`
- [ ] Probar en navegador:
  - [ ] Cambiar a Historico → ve todas las transacciones
  - [ ] Cambiar a Mensual → ve solo mes actual
  - [ ] Cambiar a Personalizado → date pickers funcionan
  - [ ] KPIs se actualizan correctamente
  - [ ] Grafica muestra datos del periodo
  - [ ] Tabla filtra correctamente
- [ ] Recargar pagina → seleccion persiste

---

## Bucle de Validacion

### Nivel 1: TypeScript
```bash
npx tsc --noEmit
# Esperado: Sin errores
```

### Nivel 2: Visual (Playwright)
```typescript
// Navegar a localhost:3000
// Click en "Historico"
// Verificar que Ingresos > $0 (ahora incluye diciembre)
// Screenshot
```

---

## Gotchas Conocidos

```typescript
// CRITICO: 'historico' debe traer TODAS las transacciones
// La BD puede tener muchas - considerar paginacion si >1000

// CRITICO: Al cambiar vista, recalcular TODO:
// - KPIs, gastosData, ingresosData, grafica

// CRITICO: Date pickers deben manejar timezone correctamente
// Usar startOfDay() y endOfDay() de date-fns

// CRITICO: El Balance en AccountsOverview es diferente
// Ese muestra balance real de cuentas (con balance_inicial)
// No confundir con Balance del periodo
```

---

## Anti-Patrones a Evitar

- NO crear nuevo store - usar financesStore existente
- NO duplicar logica de filtrado - centralizar en service
- NO hardcodear fechas - usar helpers de date-fns
- NO olvidar el loading state mientras se cargan datos
- NO mostrar datos viejos mientras carga nuevos (skeleton o spinner)

---

## Dependencias a Instalar

```bash
# Opcional para date pickers mejorados
npm install date-fns
# O usar input[type="date"] nativo (mas simple)
```

---

## Mockup Visual

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                                   │
│  Centro de control financiero                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Historico] [Mensual*] [Personalizado]   Enero 2026 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Ingresos │ │ Gastos   │ │ Balance  │ │ Trans.   │      │
│  │ $227,427 │ │ $62,748  │ │ $164,679 │ │    59    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  [Grafica de tendencias - periodo seleccionado]            │
│                                                             │
│  [Tabla de transacciones - filtrada por periodo]           │
└─────────────────────────────────────────────────────────────┘
```

---

## Referencias

- **Proyecto**: `./`
- **Stack**: Next.js 15 + React 19 + TypeScript + Tailwind + Supabase
- **Store**: Zustand con persist

---

*Este PRP es el resultado de investigacion. No se ha modificado codigo todavia.*
