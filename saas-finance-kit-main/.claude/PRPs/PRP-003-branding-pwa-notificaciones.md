# PRP-003: Branding, PWA y Sistema de Notificaciones Push

> **Estado**: PENDIENTE APROBACION
> **Fecha**: 2024-12-12
> **Autor**: Claude Opus 4.5
> **Proyecto**: Finanzas OS

---

## Objetivo

Integrar el logo de marca en toda la aplicacion (favicon, PWA, header) y migrar el sistema completo de notificaciones push desde `[tu-proyecto-financiero]` para recordatorios automaticos de gastos recurrentes.

---

## Por Que

| Problema Actual | Solucion Propuesta |
|-----------------|-------------------|
| Logo no integrado (solo en /public) | Favicon, PWA icons, Header logo |
| Sin branding consistente "Finanzas OS" | Metadata, manifest.json, titulo unificado |
| Sin recordatorios de gastos | Sistema de notificaciones push nativas |
| Usuario olvida pagos recurrentes | Alertas 1 dia antes del cobro |
| Sin funcionalidad PWA | Service Worker + manifest para instalacion |

**Valor de negocio**:
- Branding profesional listo para template de consulting
- Usuarios nunca olvidan pagos (recordatorios automaticos)
- Experiencia nativa en iOS/Android (PWA instalable)
- Diferenciador vs apps financieras basicas

---

## Que

### Comportamiento Esperado

**Branding:**
- Logo verde visible en favicon del navegador
- Logo en header/NavBar reemplazando el cuadrado azul
- PWA instalable con icono del logo
- Titulo "Finanzas OS" consistente

**Notificaciones:**
- Banner para activar notificaciones en dashboard
- Recordatorio push 1 dia antes de gastos mensuales
- Notificaciones nativas (iOS PWA, Android, Desktop)
- Registro automatico de gastos en fecha de cobro

### Criterios de Exito

- [ ] Favicon muestra logo verde en pestana del navegador
- [ ] Header/NavBar muestra logo en lugar de cuadrado azul
- [ ] PWA instalable con icono correcto (192px y 512px)
- [ ] Titulo "Finanzas OS" en metadata y manifest
- [ ] Componente NotificationPermissionButton visible en dashboard
- [ ] Push notifications funcionan en Desktop Chrome
- [ ] Push notifications funcionan en iOS (PWA instalada)
- [ ] Cron job programa notificaciones correctamente
- [ ] Notificacion llega 1 dia antes del gasto

---

## Contexto Necesario

### Documentacion & Referencias

```yaml
# LECTURA OBLIGATORIA (ya leidos durante investigacion)
- file: [tu-proyecto-financiero]/.claude/docs/sistema-notificaciones-push.md
  why: Arquitectura completa del sistema de notificaciones

- file: [tu-proyecto-financiero]/hooks/useNotifications.ts
  why: Hook cliente para permisos y suscripcion

- file: [tu-proyecto-financiero]/components/NotificationPermissionButton.tsx
  why: UI para activar notificaciones (adaptar a Neumorphism)

- file: [tu-proyecto-financiero]/public/sw.js
  why: Service Worker para recibir push en background

- file: [tu-proyecto-financiero]/app/api/push/*
  why: APIs de suscripcion y envio

- file: [tu-proyecto-financiero]/app/api/notifications/*
  why: APIs de programacion y envio automatico

- doc: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
  critical: VAPID keys requeridas para push

- doc: https://vercel.com/docs/cron-jobs
  critical: Cron jobs en vercel.json
```

### Arquitectura Actual (Business Project)

```
src/
├── app/
│   ├── (auth)/           # Login, signup, etc (ya implementado)
│   ├── (main)/           # Dashboard, finances, wizard
│   └── layout.tsx        # Root layout (modificar metadata)
├── features/
│   ├── auth/             # Autenticacion (completado)
│   └── finances/         # Finanzas (completado)
├── shared/
│   └── components/ui/
│       └── NavBar.tsx    # Header (modificar logo)
└── hooks/
    └── useAuth.ts        # Auth hook (ya existe)

public/
└── logo.png              # Logo disponible (1024x1024 PNG)
```

### Arquitectura Propuesta

```
src/
├── app/
│   ├── api/
│   │   ├── push/
│   │   │   ├── subscribe/route.ts   # POST/DELETE suscripcion
│   │   │   └── send/route.ts        # POST enviar push
│   │   ├── notifications/
│   │   │   ├── schedule/route.ts    # GET programar diarias
│   │   │   └── send-scheduled/route.ts # GET enviar pendientes
│   │   └── gastos-recurrentes/
│   │       └── procesar/route.ts    # POST registrar automaticos
│   └── layout.tsx                   # Actualizar metadata
├── features/
│   └── notifications/
│       ├── components/
│       │   ├── NotificationPermissionButton.tsx  # Banner activacion
│       │   └── ServiceWorkerRegistration.tsx     # Registro SW
│       └── hooks/
│           └── useNotifications.ts               # Hook cliente
└── hooks/
    └── useNotifications.ts                       # Re-export

public/
├── logo.png              # Logo original (ya existe)
├── icon-192.png          # PWA icon 192px (generar)
├── icon-512.png          # PWA icon 512px (generar)
├── favicon.ico           # Favicon (generar desde logo)
├── sw.js                 # Service Worker
└── manifest.json         # PWA manifest
```

### Modelos de Datos (Supabase)

```sql
-- Tabla: push_subscriptions
-- Almacena dispositivos suscritos a notificaciones
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Tabla: scheduled_notifications
-- Cola de notificaciones programadas
CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gasto_mensual_id UUID REFERENCES gastos_mensuales(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_scheduled_notifications_status ON scheduled_notifications(status);
CREATE INDEX idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX idx_scheduled_notifications_pending
  ON scheduled_notifications(status) WHERE status = 'pending';

-- RLS
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON scheduled_notifications
  FOR SELECT USING (auth.uid() = user_id);
```

---

## Blueprint de Implementacion

### Fase 1: Branding & Assets

**Objetivo**: Integrar logo en toda la aplicacion

- [ ] Generar favicon.ico desde logo.png (usar herramienta online o sharp)
- [ ] Generar icon-192.png y icon-512.png desde logo.png
- [ ] Crear public/manifest.json con branding "Finanzas OS"
- [ ] Actualizar src/app/layout.tsx con metadata correcta
- [ ] Actualizar NavBar.tsx para usar logo en header

**Validacion**:
- Favicon visible en pestana del navegador
- Logo visible en NavBar
- PWA instalable con icono correcto

### Fase 2: Infraestructura PWA

**Objetivo**: Service Worker y PWA manifest

- [ ] Crear public/sw.js (copiar y adaptar de [tu-proyecto-financiero])
- [ ] Crear ServiceWorkerRegistration.tsx component
- [ ] Agregar ServiceWorkerRegistration al layout
- [ ] Verificar que PWA es instalable

**Validacion**:
- Service Worker registrado en DevTools > Application
- Opcion "Instalar app" disponible en navegador

### Fase 3: Base de Datos

**Objetivo**: Tablas para notificaciones

- [ ] Crear migracion push_subscriptions via Supabase MCP
- [ ] Crear migracion scheduled_notifications via Supabase MCP
- [ ] Verificar RLS policies
- [ ] Ejecutar get_advisors para verificar seguridad

**Validacion**:
- Tablas visibles en Supabase dashboard
- RLS habilitado en ambas tablas

### Fase 4: Hook useNotifications

**Objetivo**: Logica cliente para permisos y suscripcion

- [ ] Crear src/features/notifications/hooks/useNotifications.ts
- [ ] Re-exportar desde src/hooks/useNotifications.ts
- [ ] Incluir requestPermission, subscribe, unsubscribe, sendTestNotification

**Validacion**:
- Hook usable en componentes
- TypeScript sin errores

### Fase 5: APIs de Push

**Objetivo**: Endpoints para suscripcion y envio

- [ ] Crear app/api/push/subscribe/route.ts (POST/DELETE)
- [ ] Crear app/api/push/send/route.ts (POST)
- [ ] Instalar dependencia web-push

**Validacion**:
- Endpoints responden correctamente
- Suscripcion se guarda en DB

### Fase 6: APIs de Notificaciones Automaticas

**Objetivo**: Programacion y envio automatico

- [ ] Crear app/api/notifications/schedule/route.ts
- [ ] Crear app/api/notifications/send-scheduled/route.ts
- [ ] Crear app/api/gastos-recurrentes/procesar/route.ts
- [ ] Crear vercel.json con cron jobs

**Validacion**:
- Llamar endpoints manualmente funciona
- Notificaciones se programan correctamente

### Fase 7: UI Component

**Objetivo**: Banner para activar notificaciones

- [ ] Crear NotificationPermissionButton.tsx con Neumorphism
- [ ] Agregar al dashboard principal
- [ ] Manejar estados: no soportado, pendiente, activo, denegado

**Validacion**:
- Banner visible en dashboard
- Click en "Activar" solicita permisos
- Notificacion de prueba funciona

### Fase 8: Variables de Entorno

**Objetivo**: Configurar VAPID keys

- [ ] Generar VAPID keys con npx web-push generate-vapid-keys
- [ ] Agregar a .env.local
- [ ] Agregar a Vercel environment variables

**Validacion**:
- Push notifications funcionan end-to-end

### Fase 9: Validacion E2E

**Objetivo**: Testing completo del sistema

- [ ] Validar flujo completo con Playwright
- [ ] Probar notificaciones en Desktop Chrome
- [ ] Probar PWA en iOS (si es posible)
- [ ] Verificar que no hay errores de TypeScript
- [ ] npm run build exitoso
- [ ] Fix de cualquier error detectado

---

## Bucle de Validacion

### Nivel 1: TypeScript & Linting
```bash
npm run typecheck
npm run lint

# Esperado: Sin errores
```

### Nivel 2: Build
```bash
npm run build

# Esperado: Build exitoso sin warnings criticos
```

### Nivel 3: Visual (Playwright)
```typescript
// Navegar a /
// Verificar logo en NavBar
// Verificar favicon
// Verificar banner de notificaciones
// Click en "Activar notificaciones"
// Aceptar permisos
// Verificar "Probar" funciona
```

---

## Gotchas Conocidos

```typescript
// CRITICO: VAPID keys deben generarse UNA VEZ y reutilizarse
// npx web-push generate-vapid-keys
// Guardar en .env y Vercel

// CRITICO: iOS requiere PWA instalada en Home Screen
// Las notificaciones NO funcionan en Safari mobile
// Solo funcionan cuando se abre desde icono PWA

// CRITICO: Service Worker debe estar en /public/sw.js
// No puede estar en src/ ni en subdirectorios

// CRITICO: web-push es dependencia del servidor
// No importar en componentes cliente

// CRITICO: Cron jobs de Vercel tienen timeout de 60s
// Las APIs deben completar en ese tiempo

// CRITICO: iOS 16.4+ requerido para push en PWA
// Versiones anteriores no soportan

// NEUMORPHISM: Adaptar estilos del componente
// Usar shadow-neu, bg-neu-bg, etc.
```

---

## Anti-Patrones a Evitar

- NO hardcodear VAPID keys en el codigo
- NO crear Service Worker en src/ (debe estar en public/)
- NO importar web-push en codigo cliente
- NO asumir que notificaciones funcionan en todos los navegadores
- NO olvidar RLS en tablas nuevas
- NO usar estilos dark/light (mantener Neumorphism neutral)

---

## Dependencias a Instalar

```bash
npm install web-push
```

---

## Variables de Entorno

```env
# .env.local (agregar estas)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BAw_E3KrF9Xbng...  # Generar con web-push
VAPID_PRIVATE_KEY=JzyyJ2TSqbi...                 # Generar con web-push
VAPID_SUBJECT=mailto:support@finanzas-os.com    # Email de contacto
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app   # URL de produccion
```

---

## Codigo Fuente de Referencia

El sistema de notificaciones ya esta implementado en:
```
./[tu-proyecto-financiero]/
├── .claude/docs/sistema-notificaciones-push.md  # Documentacion completa
├── hooks/useNotifications.ts                    # Hook cliente
├── components/NotificationPermissionButton.tsx  # UI component
├── components/ServiceWorkerRegistration.tsx     # Registro SW
├── public/sw.js                                 # Service Worker
├── public/manifest.json                         # PWA manifest
├── app/api/push/subscribe/route.ts              # Suscripcion
├── app/api/push/send/route.ts                   # Enviar push
├── app/api/notifications/schedule/route.ts      # Programar
├── app/api/notifications/send-scheduled/route.ts # Enviar programadas
└── vercel.json                                  # Cron jobs
```

El codigo se puede copiar y adaptar:
- Estilos: Cambiar dark/light a Neumorphism
- Nombre: Cambiar "Finanzas - Dashboard Inteligente" a "Finanzas OS"
- Colores: Adaptar verde del logo (#059669) como accent color

---

## Estimacion de Trabajo

| Fase | Descripcion | Complejidad |
|------|-------------|-------------|
| 1 | Branding & Assets | Baja |
| 2 | PWA Infrastructure | Baja |
| 3 | Database | Media |
| 4 | Hook | Baja |
| 5 | Push APIs | Media |
| 6 | Notification APIs | Media |
| 7 | UI Component | Baja |
| 8 | Environment | Baja |
| 9 | E2E Testing | Media |

**Total**: Sistema completo funcional

---

## Referencias

- **Proyecto destino**: `./`
- **Proyecto fuente**: `./[tu-proyecto-financiero]`
- **Logo**: `.//public/logo.png`
- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind + Supabase

---

*Este PRP es el resultado de investigacion. No se ha modificado codigo todavia.*
