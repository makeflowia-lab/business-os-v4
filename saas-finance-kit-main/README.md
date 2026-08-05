# 💰 SaaS Finance Kit — CFO Virtual con IA

> **Template production-ready** de sistema de control financiero personal con un agente CFO impulsado por IA. Construido con Next.js 16, Supabase y Claude Code.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%2B%20Auth-green?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 ¿Qué es esto?

Un **sistema de finanzas personales SaaS** con un agente CFO virtual que:

- Registra y categoriza transacciones (gastos, ingresos, transferencias)
- Gestiona gastos recurrentes mensuales y anuales
- Provee un dashboard con KPIs financieros y gráficas de tendencias
- Incluye un **Agente CFO IA** que analiza tus finanzas en tiempo real usando streaming SSE
- Panel de administración para configurar usuarios y cuentas
- Calculadora financiera integrada
- Arquitectura Feature-First optimizada para desarrollo asistido por IA

---

## 📦 Tech Stack

```yaml
Framework:    Next.js 16 (App Router + Turbopack)
Runtime:      Node.js + TypeScript 5.7
Database:     PostgreSQL via Supabase
Auth:         Supabase Auth (Email/Password)
Styling:      Tailwind CSS 3.4
State:        Zustand 5
AI:           Vercel AI SDK 5 + OpenRouter (Claude/GPT-4)
Charts:       Chart.js + react-chartjs-2
Icons:        Lucide React
Validation:   Zod 4
Dev Tools:    Claude Code + MCPs (Playwright, Supabase, Next.js DevTools)
Deploy:       Vercel
```

---

## 🏗️ Arquitectura: Feature-First

Diseñada específicamente para **desarrollo asistido por IA**. Cada feature es autocontenida.

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo: rutas públicas
│   │   └── login/page.tsx        # Login con Supabase
│   ├── (main)/                   # Grupo: rutas protegidas
│   │   ├── dashboard/page.tsx    # Dashboard principal
│   │   ├── finances/             # Módulo finanzas
│   │   │   ├── page.tsx          # Transacciones
│   │   │   ├── recurring/        # Gastos recurrentes mensuales
│   │   │   └── annual/           # Gastos recurrentes anuales
│   │   ├── agent/page.tsx        # Agente CFO IA
│   │   ├── admin/page.tsx        # Panel administración
│   │   ├── calculator/page.tsx   # Calculadora financiera
│   │   └── wizard/page.tsx       # Setup wizard
│   ├── api/                      # API Routes (Edge-ready)
│   │   ├── agent/route.ts        # SSE streaming del agente IA
│   │   ├── chat/route.ts         # Chat handler
│   │   ├── transacciones/        # CRUD transacciones
│   │   ├── gastos-mensuales/     # CRUD gastos mensuales
│   │   ├── gastos-anuales/       # CRUD gastos anuales
│   │   └── reportes/             # Generación de reportes
│   └── layout.tsx                # Root layout con providers
│
├── features/                     # 🎯 Lógica por funcionalidad
│   ├── auth/                     # Autenticación
│   │   ├── components/           # LoginForm
│   │   ├── hooks/                # useAuth, useSession
│   │   ├── services/             # authService.ts
│   │   └── types/                # User, Session
│   ├── finances/                 # Sistema financiero
│   │   ├── components/           # TransactionList, AddTransactionModal,
│   │   │                         # AccountsOverview, RecurringExpenses...
│   │   ├── hooks/                # useTransactions, useFinances
│   │   ├── services/             # analytics.ts, financesService.ts
│   │   └── types/                # Transaction, GastoMensual, GastoAnual, Cuenta
│   ├── dashboard/                # KPIs y visualizaciones
│   │   ├── components/           # KPICard, TrendChart, CategoryChart
│   │   ├── hooks/                # useDashboard
│   │   └── types/                # DashboardData, KPIs
│   ├── agent/                    # Agente CFO IA
│   │   ├── components/           # ActionFeed, ActionItem
│   │   ├── hooks/                # useAgentHistory, useActionStream
│   │   ├── services/             # historyService.ts
│   │   └── types/                # Action, AgentSession
│   ├── admin/                    # Panel administración
│   │   ├── components/           # UserManager, AccountConfig
│   │   └── services/             # adminService.ts
│   └── calculator/               # Calculadora financiera
│       ├── components/           # CalculatorWidget
│       └── store/                # calculatorStore.ts
│
└── shared/                       # Código reutilizable
    ├── components/               # Button, Card, Modal, Sidebar, Navbar
    ├── hooks/                    # useDebounce, useLocalStorage
    ├── stores/                   # appStore.ts, userStore.ts
    ├── types/                    # api.ts, domain.ts
    ├── utils/                    # formatters, validators
    ├── lib/                      # supabase/client.ts, supabase/server.ts
    └── constants/                # rutas, categorías
```

---

## 🗄️ Esquema de Base de Datos (Supabase/PostgreSQL)

### Tablas Principales

```sql
-- Perfiles de usuario (sincronizado con auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Control de acceso: emails permitidos (whitelist)
CREATE TABLE allowed_emails (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cuentas bancarias del usuario
CREATE TABLE cuentas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users ON DELETE CASCADE,
  nombre          TEXT NOT NULL,           -- 'Cuenta Digital 1', etc.
  tipo            TEXT NOT NULL,           -- 'debito' | 'credito' | 'efectivo'
  balance_inicial NUMERIC DEFAULT 0,
  fecha_corte     TEXT,                    -- Para tarjetas de crédito
  color           TEXT,                    -- Color de UI: 'purple', 'orange', etc.
  activa          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Transacciones (gastos, ingresos, transferencias)
CREATE TABLE transacciones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users ON DELETE CASCADE,
  tipo            TEXT NOT NULL,           -- 'ingreso' | 'gasto' | 'transferencia'
  monto           NUMERIC NOT NULL,
  categoria       TEXT NOT NULL,
  descripcion     TEXT,
  fecha_hora      TIMESTAMPTZ NOT NULL,
  cuenta          TEXT NOT NULL,           -- Nombre de la cuenta origen
  cuenta_destino  TEXT,                    -- Solo para transferencias
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Gastos recurrentes mensuales (Netflix, Spotify, etc.)
CREATE TABLE gastos_mensuales (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users ON DELETE CASCADE,
  nombre_app   TEXT NOT NULL,
  categoria    TEXT NOT NULL,
  dia_de_cobro INTEGER NOT NULL,           -- 1-31
  monto        NUMERIC NOT NULL,
  activo       BOOLEAN DEFAULT TRUE,
  cuenta       TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Gastos recurrentes anuales (dominios, seguros, etc.)
CREATE TABLE gastos_anuales (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users ON DELETE CASCADE,
  nombre_servicio  TEXT NOT NULL,
  categoria        TEXT NOT NULL,
  mes_de_cobro     INTEGER NOT NULL,       -- 1-12
  dia_de_cobro     INTEGER NOT NULL,       -- 1-31
  monto            NUMERIC NOT NULL,
  activo           BOOLEAN DEFAULT TRUE,
  cuenta           TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Sesiones del Agente CFO IA
CREATE TABLE agent_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users ON DELETE CASCADE,
  title      TEXT,
  model      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Acciones de cada sesión del agente
CREATE TABLE agent_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES agent_sessions ON DELETE CASCADE,
  action_type TEXT NOT NULL,              -- 'think' | 'analyze' | 'calculate' | 'recommend' | 'alert' | 'message'
  content     JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. El patrón es:

```sql
-- Habilitar RLS
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios solo ven sus propios datos
CREATE POLICY "Users see own data" ON transacciones
  FOR ALL USING (auth.uid() = user_id);

-- Para cuentas (lectura): todos los usuarios autenticados ven cuentas
CREATE POLICY "Authenticated read cuentas" ON cuentas
  FOR SELECT USING (auth.role() = 'authenticated');
```

### Categorías Disponibles

```typescript
// Gastos
EXPENSE_CATEGORIES = [
  'Comida', 'Transporte', 'Entretenimiento', 'Salud',
  'Tecnología', 'Ropa', 'Educación', 'Servicios',
  'Deudas', 'Otros'
]

// Ingresos
INCOME_CATEGORIES = [
  'Salario', 'Freelance', 'Inversiones',
  'Ventas', 'Transferencia', 'Otros'
]
```

---

## 🤖 El Agente CFO — Action Stream Pattern

El agente usa streaming SSE para mostrar su razonamiento en tiempo real:

```
Usuario escribe → POST /api/agent → OpenRouter (Claude/GPT) →
streamText() genera JSON → closeAndParseJson() parsea parcial →
SSE envía acciones una por una → Cliente renderiza en tiempo real
```

### Tipos de Acciones del Agente

```json
{
  "actions": [
    { "_type": "think",       "text": "Analizando tus finanzas..." },
    { "_type": "analyze",     "metric": "Balance",    "value": 5000,   "status": "good|warning|critical", "insight": "..." },
    { "_type": "calculate",   "label": "Ahorro",      "formula": "Ingresos - Gastos", "result": 2000, "unit": "MXN" },
    { "_type": "recommend",   "priority": "high|medium|low", "title": "...", "description": "...", "impact": "..." },
    { "_type": "alert",       "severity": "info|warning|critical", "message": "..." },
    { "_type": "message",     "text": "Tu balance actual es saludable." }
  ]
}
```

---

## 🚀 Setup Completo

### Prerrequisitos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Cuenta en [OpenRouter](https://openrouter.ai) (para el agente IA)
- [Claude Code](https://claude.ai/code) instalado (opcional, para desarrollo asistido)

### 1. Clonar e Instalar

```bash
git clone https://github.com/tu-usuario/saas-finance-kit.git
cd saas-finance-kit
npm install
```

### 2. Variables de Entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:

```env
# Supabase (REQUERIDO)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenRouter - Para el Agente CFO IA (REQUERIDO para el agente)
OPENROUTER_API_KEY=sk-or-v1-...
```

> **Dónde obtener las keys:**
> - Supabase URL + Anon Key: Dashboard → Project Settings → API
> - OpenRouter: [openrouter.ai/keys](https://openrouter.ai/keys)

### 3. Configurar Base de Datos en Supabase

Ejecuta estas migraciones en el **SQL Editor** de Supabase (en orden):

#### Migración 1: Tablas Base

```sql
-- Profiles (sincronizado con auth.users via trigger)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear profile automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Whitelist de emails permitidos
CREATE TABLE public.allowed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Migración 2: Sistema Financiero

```sql
-- Cuentas bancarias
CREATE TABLE public.cuentas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('debito', 'credito', 'efectivo')),
  balance_inicial NUMERIC DEFAULT 0,
  fecha_corte TEXT,
  color TEXT DEFAULT 'gray',
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transacciones
CREATE TABLE public.transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto', 'transferencia')),
  monto NUMERIC NOT NULL CHECK (monto > 0),
  categoria TEXT NOT NULL,
  descripcion TEXT,
  fecha_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cuenta TEXT NOT NULL,
  cuenta_destino TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gastos recurrentes mensuales
CREATE TABLE public.gastos_mensuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  nombre_app TEXT NOT NULL,
  categoria TEXT NOT NULL,
  dia_de_cobro INTEGER NOT NULL CHECK (dia_de_cobro BETWEEN 1 AND 31),
  monto NUMERIC NOT NULL CHECK (monto > 0),
  activo BOOLEAN DEFAULT TRUE,
  cuenta TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gastos recurrentes anuales
CREATE TABLE public.gastos_anuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  nombre_servicio TEXT NOT NULL,
  categoria TEXT NOT NULL,
  mes_de_cobro INTEGER NOT NULL CHECK (mes_de_cobro BETWEEN 1 AND 12),
  dia_de_cobro INTEGER NOT NULL CHECK (dia_de_cobro BETWEEN 1 AND 31),
  monto NUMERIC NOT NULL CHECK (monto > 0),
  activo BOOLEAN DEFAULT TRUE,
  cuenta TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Migración 3: Agente IA

```sql
-- Sesiones del agente
CREATE TABLE public.agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Acciones del agente
CREATE TABLE public.agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Migración 4: Row Level Security

```sql
-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS para cuentas (lectura pública para autenticados)
ALTER TABLE cuentas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read cuentas" ON cuentas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users manage own cuentas" ON cuentas FOR ALL USING (auth.uid() = user_id);

-- RLS para transacciones
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own transacciones" ON transacciones FOR ALL USING (auth.uid() = user_id);

-- RLS para gastos_mensuales
ALTER TABLE gastos_mensuales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gastos_mensuales" ON gastos_mensuales FOR ALL USING (auth.uid() = user_id);

-- RLS para gastos_anuales
ALTER TABLE gastos_anuales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gastos_anuales" ON gastos_anuales FOR ALL USING (auth.uid() = user_id);

-- RLS para agent_sessions
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON agent_sessions FOR ALL USING (auth.uid() = user_id);

-- RLS para agent_actions
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own actions" ON agent_actions FOR ALL
  USING (session_id IN (SELECT id FROM agent_sessions WHERE user_id = auth.uid()));
```

### 4. Configurar Cuentas Bancarias

El sistema usa un array de cuentas en `src/features/finances/types/index.ts`. Modifica a tus necesidades:

```typescript
export const CUENTAS = [
  'Cuenta Digital 1',    // Ej: Nu, Mercado Pago, Revolut
  'Cuenta Débito 1',     // Ej: Banco principal
  'Efectivo',
  'Tarjeta Crédito 1',   // Ej: Tarjeta de crédito
  'Cuenta Débito 2',     // Cuenta secundaria
] as const
```

También inserta las cuentas en la base de datos:

```sql
-- Reemplaza 'tu-user-id' con el UUID de tu usuario en auth.users
INSERT INTO cuentas (user_id, nombre, tipo, balance_inicial, color) VALUES
  ('tu-user-id', 'Cuenta Digital 1',  'debito',   0, 'purple'),
  ('tu-user-id', 'Cuenta Débito 1',   'debito',   0, 'orange'),
  ('tu-user-id', 'Efectivo',          'efectivo', 0, 'emerald'),
  ('tu-user-id', 'Tarjeta Crédito 1', 'credito',  0, 'pink'),
  ('tu-user-id', 'Cuenta Débito 2',   'debito',   0, 'amber');
```

### 5. Agregar tu Email a la Whitelist

Esta app usa autenticación por whitelist. Agrega tu email:

```sql
INSERT INTO allowed_emails (email) VALUES ('tu@email.com');
```

### 6. Iniciar Desarrollo

```bash
npm run dev
# Abre: http://localhost:3000
```

---

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo con Turbopack (auto-port 3000-3006)
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run typecheck    # Verificación TypeScript
```

---

## 🤖 Configuración de Claude Code + MCPs

Si usas Claude Code para desarrollo asistido por IA, configura los MCPs:

### 1. Copiar configuración de ejemplo

```bash
cp .claude/example.mcp.json .mcp.json
```

### 2. Editar `.mcp.json` con tus credenciales

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=TU_PROJECT_REF"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "TU_SUPABASE_ACCESS_TOKEN"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

> **Tokens de Supabase:**
> - Project REF: Dashboard → Settings → General → "Reference ID"
> - Access Token: [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)

### 3. Comandos de Claude Code disponibles

| Comando | Descripción |
|---------|-------------|
| `/generar-prp` | Genera un PRP (Product Requirements Proposal) para una nueva feature |
| `/ejecutar-prp` | Ejecuta un PRP existente paso a paso |
| `/primer` | Inicializa el contexto del proyecto para una nueva sesión |

---

## 🌐 Deploy en Vercel

### 1. Conectar repositorio

```bash
npm install -g vercel
vercel
```

### 2. Variables de entorno en Vercel

En el dashboard de Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJhbGci...
OPENROUTER_API_KEY              = sk-or-v1-...
```

### 3. Configurar dominio de producción en Supabase

En Supabase → Authentication → URL Configuration:
- **Site URL**: `https://tu-app.vercel.app`
- **Redirect URLs**: `https://tu-app.vercel.app/**`

---

## 📁 Archivos de Configuración Clave

```
├── CLAUDE.md                     # System prompt para Claude Code
├── .env.local.example            # Template de variables de entorno
├── .claude/
│   ├── example.mcp.json          # Ejemplo de configuración MCPs
│   ├── agents/                   # Agentes especializados de Claude Code
│   ├── commands/                 # Comandos personalizados (/generar-prp, etc.)
│   ├── prompts/                  # Metodologías de desarrollo
│   ├── PRPs/                     # Historial de features implementadas
│   └── ai_templates/             # Plantillas de código IA (Action Stream, etc.)
├── docs/
│   └── AGENT_CONTEXT.md          # Contexto técnico del agente CFO IA
├── src/
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── models.ts         # Configuración de modelos (Claude, GPT-4o)
│   │   │   └── closeAndParseJson.ts  # Parser de JSON streaming (NO MODIFICAR)
│   │   └── supabase/
│   │       ├── client.ts         # Cliente Supabase (singleton, browser)
│   │       └── server.ts         # Cliente Supabase (server-side)
│   └── middleware.ts             # Protección de rutas con Supabase Auth
```

---

## 🔒 Seguridad

- **Autenticación**: Supabase Email/Password con whitelist de emails
- **Autorización**: Row Level Security en todas las tablas
- **Variables sensibles**: Nunca en el código, siempre en `.env.local`
- **Middleware**: `src/middleware.ts` protege todas las rutas en `/(main)/`

---

## 🧪 Flujo de Desarrollo Recomendado

Este proyecto está optimizado para el **Agent Loop**:

```
1. Abre Claude Code: claude
2. Inicializa contexto: /primer
3. Describe tu feature → Claude genera el PRP
4. Ejecuta el PRP: /ejecutar-prp
5. Claude implementa, hace screenshot con Playwright, itera
6. Valida en http://localhost:3000
```

---

## 📊 Features Incluidas

| Feature | Estado | Descripción |
|---------|--------|-------------|
| Auth con whitelist | ✅ | Login Email/Password + control de acceso |
| Dashboard KPIs | ✅ | Balance, ingresos, gastos, transacciones |
| Gráficas de tendencias | ✅ | Ingresos vs gastos por período |
| Gráficas por categoría | ✅ | Distribución de gastos |
| Transacciones CRUD | ✅ | Crear, editar, eliminar transacciones |
| Filtros de fecha | ✅ | Histórico, mensual, personalizado |
| Vista de cuentas | ✅ | Balance por cuenta bancaria |
| Gastos recurrentes mensuales | ✅ | Netflix, Spotify, etc. |
| Gastos recurrentes anuales | ✅ | Dominios, seguros, etc. |
| Procesamiento automático | ✅ | API que procesa recurrentes en fecha de cobro |
| Agente CFO IA | ✅ | Streaming SSE con Action Stream Pattern |
| Historial de sesiones IA | ✅ | Persistencia en Supabase |
| Panel Admin | ✅ | Gestión de usuarios permitidos |
| Calculadora financiera | ✅ | Calculadora integrada |
| PWA Ready | ✅ | manifest.json + íconos |

---

## 🏷️ Personalización Rápida

### Cambiar el nombre de la app

Busca y reemplaza `SaaS Finance Kit` en:
- `src/app/layout.tsx` (título)
- `public/manifest.json` (nombre PWA)

### Agregar nuevas categorías

```typescript
// src/lib/categoryColors.ts
export const EXPENSE_CATEGORIES = [
  ...EXPENSE_CATEGORIES,
  'Tu Nueva Categoría'
]
```

### Cambiar el modelo de IA del agente

```typescript
// src/lib/ai/models.ts
export const DEFAULT_MODEL = 'anthropic/claude-3-5-haiku'
// Opciones: 'anthropic/claude-sonnet-4-5', 'openai/gpt-4o', etc.
```

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea tu branch: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -m 'feat: agrega nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Abre un Pull Request

---

## 📄 Licencia

MIT — Libre para uso personal y comercial.

---

**Construido con Next.js 16 + Supabase + Claude Code** 🤖
