# SaaS Legal Shield - Checklist de Revisión y Blindaje

> Guía reutilizable para auditar y blindar cualquier SaaS.  
> Basado en la revisión completa del proyecto Legal Shield (Feb 2026).

---

## 1. AUTENTICACIÓN Y SEGURIDAD

### Problema detectado
- Dos sistemas de autenticación en conflicto (NextAuth + cookies manuales).
- Passwords almacenados en texto plano.
- Sin protección de rutas (cualquier usuario accedía sin login).

### Solución aplicada
- **Unificar auth en un solo sistema** (NextAuth con Magic Link vía Resend).
- **Eliminar código legacy**: `loginUser`, `logoutUser`, `registerUser`, `loginWithGoogle`, `verifyUser`.
- **Server actions** ahora usan `auth()` de NextAuth para obtener la sesión.
- **Auto-provisioning de tenant** al primer login (si el usuario no tiene tenant, se crea uno automáticamente).
- **Middleware de protección** que redirige a `/login` si no hay sesión.
- **SessionProvider** en el layout raíz para que `useSession()` funcione en componentes cliente.

### Checklist para nuevo SaaS
- [ ] ¿Hay un solo sistema de autenticación? (no mezclar cookies manuales con NextAuth/Clerk/etc.)
- [ ] ¿Las passwords se hashean con bcrypt/argon2? (o mejor: usar Magic Link / OAuth)
- [ ] ¿Existe middleware que proteja rutas privadas?
- [ ] ¿El SessionProvider envuelve toda la app?
- [ ] ¿Las server actions validan la sesión antes de ejecutarse?
- [ ] ¿Se eliminó todo código de auth legacy/duplicado?

---

## 2. PROTECCIÓN DE RUTAS

### Problema detectado
- Cualquier persona podía acceder a `/legal-shield`, `/settings`, `/dashboard` sin login.

### Solución aplicada
```typescript
// src/middleware.ts
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const publicRoutes = ["/login", "/signup", "/verificar-email", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/legal-shield", req.nextUrl));
  }
});
```

### Checklist para nuevo SaaS
- [ ] ¿Existe un middleware/proxy que proteja todas las rutas privadas?
- [ ] ¿Las rutas públicas están explícitamente definidas?
- [ ] ¿Un usuario logueado es redirigido si intenta ir a `/login`?
- [ ] ¿Los assets estáticos (`_next`, imágenes, favicon) no son bloqueados?

---

## 3. MOTOR DE ANÁLISIS DE RIESGO

### Problema detectado
- Solo evaluaba 4 factores de riesgo (industria, datos personales, sensibles, criticidad).
- Faltaban: transferencias internacionales, menores de edad, análisis jurisdiccional, sectores regulados.

### Solución aplicada — Factores de riesgo v2.0

| Factor | Puntaje | Detalle |
|--------|---------|---------|
| Base | +10 | Todo SaaS tiene riesgo mínimo |
| Sector Salud | +30 | NOM-024-SSA3, datos clínicos |
| Sector Fintech | +30 | Ley FINTECH, CNBV, PLD, KYC/AML |
| Sector Legal | +20 | Secreto profesional |
| Sector Educación | +15 | Menores de edad, consentimiento parental |
| Sector E-commerce | +10 | PROFECO, NOM-247 |
| Datos Personales | +15 | LFPDPPP, ARCO, Aviso de Privacidad |
| Datos Sensibles | +35 | Consentimiento escrito, EIPD, INAI, AES-256 |
| Criticidad Alta | +25 | DRP, redundancia, auditoría semestral |
| Criticidad Media | +10 | Backups diarios, plan básico |
| Jurisdicción extranjera | +15 | CCPA, RGPD, Ley 1581, transferencia internacional |
| Facturación electrónica | — | CFDI 4.0, conservación 5 años |
| SLA | — | Uptime 99.9%, créditos por incumplimiento |

### Clasificación
- **ALTO** (>70): Requiere protocolos reforzados, DRP, cifrado, EIPD
- **MEDIO** (>35): Requiere aviso de privacidad, controles estándar
- **BAJO** (≤35): Obligaciones base suficientes

### Obligaciones base (aplican a TODO SaaS en México)
1. LFPDPPP (Ley Federal de Protección de Datos Personales)
2. Ley Federal de Derecho de Autor (registro Indautor)
3. Código de Comercio Art. 89-114 (Comercio Electrónico)
4. NOM-151-SCFI-2002 (Conservación de mensajes de datos)

### Checklist para nuevo SaaS
- [ ] ¿El motor evalúa la industria específica del cliente?
- [ ] ¿Diferencia entre datos personales y datos sensibles?
- [ ] ¿Evalúa criticidad operativa (bajo/medio/alto)?
- [ ] ¿Considera jurisdicción (México, USA, UE, Colombia)?
- [ ] ¿Genera obligaciones legales específicas por factor?
- [ ] ¿Genera alertas accionables (no genéricas)?

---

## 4. TEMPLATES LEGALES (15 documentos)

### Problema detectado
- Templates eran esqueletos de 3-5 líneas, no contratos ejecutables.
- Aviso de Privacidad no cumplía LFPDPPP.
- Jurisdicción hardcodeada a "Ciudad de México".
- Faltaban cláusulas esenciales: vigencia, fuerza mayor, indemnización, anticorrupción.

### Solución aplicada — Documentos production-ready

| # | Documento | Cláusulas clave | Condicional |
|---|-----------|----------------|-------------|
| 01 | Contrato Maestro MSSA | Objeto, vigencia, pagos, obligaciones, propiedad datos, modificaciones, fuerza mayor, indemnización, anticorrupción, subcontratación, notificaciones | Siempre |
| 02 | Aviso de Privacidad | Identidad responsable, datos recabados, finalidades 1rias/2rias, limitación uso, transferencias, ARCO completo, revocación, cookies, INAI | `personalData === true` |
| 03 | Datos Sensibles | Consentimiento escrito, AES-256, MFA, segregación, EIPD, notificación 24hrs | `sensibleData === true` |
| 04 | Licencia IP | Licencia no exclusiva, propiedad del proveedor, restricciones, PI del cliente, marcas, infracción | Siempre |
| 05 | SLA | Uptime 99.9%, tabla severidades S1-S4, créditos escalonados, soporte, RPO/RTO, reportes | `hasSLA === true` |
| 06 | Facturación CFDI | CFDI 4.0, datos fiscales, plazos pago, conservación 5 años, cancelación | `hasElectronicBilling === true` |
| 07 | Limitación Responsabilidad | Límite 12 meses, exclusiones, excepciones (dolo), mitigación, prescripción | Siempre |
| 08 | Continuidad Negocio | DRP (RTO 4hrs, RPO 1hr), escrow código fuente, transición 90 días, auditorías | `criticality === 'Alto'` |
| 09 | NDA | Definición bilateral, obligaciones, exclusiones, vigencia 5 años, devolución/destrucción | Siempre |
| 10 | Seguridad Información | TLS 1.3, AES-256, WAF, MFA, mínimo privilegio, monitoreo, pentesting anual, respuesta incidentes | Siempre |
| 11 | Portabilidad y Borrado | Exportación CSV/JSON/SQL, 30 días post-terminación, borrado NIST 800-88, certificado destrucción | Siempre |
| 12 | Implementación | Alcance, cronograma 30 días, capacitación, UAT, acta entrega-recepción | Siempre |
| 13 | Jurisdicción | Ley aplicable dinámica, resolución amigable, mediación, jurisdicción, supervivencia | Siempre |
| 14 | Referencia Comercial | Autorización revocable, restricciones, case study con aprobación | Siempre |
| 15 | Terminación | Por conveniencia (30 días), por incumplimiento (15 días), causales inmediatas, efectos, anti lock-in | Siempre |

### Variables de template
```
{{PROVEEDOR_RAZON_SOCIAL}}    {{CLIENTE_RAZON_SOCIAL}}
{{PROVEEDOR_RFC}}              {{CLIENTE_RFC}}
{{PROVEEDOR_DOMICILIO}}        {{CLIENTE_DOMICILIO}}
{{PROVEEDOR_REP}}              {{CLIENTE_REP}}
{{PROVEEDOR_EMAIL}}            {{PRODUCTO_NOMBRE}}
{{JURISDICCION}}               {{INDUSTRIA}}
{{MODELO_NEGOCIO}}             {{DATOS_DESC}}
{{FECHA_ACTUAL}}
```

### Checklist para nuevo SaaS
- [ ] ¿Cada template tiene cláusulas completas y detalladas (no esqueletos)?
- [ ] ¿El Aviso de Privacidad incluye: finalidades 1rias/2rias, ARCO, revocación, cookies, INAI?
- [ ] ¿La jurisdicción es dinámica (no hardcodeada)?
- [ ] ¿Los templates condicionales se activan/desactivan según los flags del formulario?
- [ ] ¿Incluye cláusulas de: fuerza mayor, indemnización, anticorrupción, subcontratación?
- [ ] ¿El contrato maestro tiene mínimo 12 cláusulas?

---

## 5. AVISO DE PRIVACIDAD (LFPDPPP)

### Requisitos legales obligatorios (Art. 15-18 LFPDPPP)

| Sección | Obligatorio | Incluido |
|---------|:-----------:|:--------:|
| Identidad y domicilio del responsable | Si | Si |
| Datos personales que se recaban | Si | Si |
| Finalidades primarias del tratamiento | Si | Si |
| Finalidades secundarias | Si | Si |
| Mecanismos para limitar uso/divulgación | Si | Si |
| Transferencias a terceros | Si | Si |
| Derechos ARCO (procedimiento completo) | Si | Si |
| Revocación del consentimiento | Si | Si |
| Uso de cookies y tecnologías de rastreo | Si | Si |
| Procedimiento de cambios al aviso | Si | Si |
| Autoridad competente (INAI) | Si | Si |
| Fecha de última actualización | Si | Si |

### Checklist para nuevo SaaS
- [ ] ¿Incluye las 12 secciones obligatorias de la tabla anterior?
- [ ] ¿Diferencia finalidades primarias (contractuales) de secundarias (marketing)?
- [ ] ¿Incluye mecanismo de opt-out para finalidades secundarias?
- [ ] ¿Describe el procedimiento ARCO con plazos (20 días respuesta, 15 días ejecución)?
- [ ] ¿Menciona al INAI como autoridad competente?

---

## 6. FUNCIONALIDADES QUE DEBEN PERSISTIR

### Problema detectado
- ConfigPanel solo hacía `console.log` (no guardaba).
- Las alertas se perdían al recargar un análisis del historial.

### Solución aplicada
- **ConfigPanel**: Ahora llama a `updateTenantBranding()` que guarda en la tabla `tenants`.
- **Historial**: Las alertas se guardan en `legalSnippets.alerts` y se extraen correctamente en `handleSelectHistory`.

### Checklist para nuevo SaaS
- [ ] ¿Toda funcionalidad de "guardar" realmente persiste en la base de datos?
- [ ] ¿Los datos del historial se reconstruyen correctamente al seleccionarlos?
- [ ] ¿No hay `console.log` como sustituto de persistencia real?

---

## 7. MULTI-TENANCY

### Estructura actual
```
tenants (id, name, slug, domain, branding)
   └── users (id, tenantId, email, name)
        └── assessments (tenantId, ...)
        └── contracts (tenantId, ...)
        └── resources (tenantId, ...)
```

### Checklist para nuevo SaaS
- [ ] ¿Todas las tablas de datos tienen `tenantId` como foreign key?
- [ ] ¿Todas las queries filtran por `tenantId` del usuario logueado?
- [ ] ¿Un usuario no puede acceder a datos de otro tenant?
- [ ] ¿Al crear un usuario nuevo se auto-crea su tenant?

---

## 8. STACK TÉCNICO RECOMENDADO

| Componente | Herramienta | Notas |
|------------|-------------|-------|
| Framework | Next.js 16+ | App Router, Server Actions |
| Auth | NextAuth v5 + Resend | Magic Link (sin configurar Google OAuth) |
| DB | Neon (PostgreSQL serverless) | Compatible con Drizzle ORM |
| ORM | Drizzle ORM | Type-safe, migraciones con `drizzle-kit push` |
| Email | Resend | Gratis para desarrollo, `onboarding@resend.dev` |
| Deploy | Vercel | Variables de entorno en dashboard |
| CSS | Tailwind CSS | Con diseño dark mode premium |

### Variables de entorno requeridas
```env
DATABASE_URL="postgresql://..."      # Neon connection string
AUTH_SECRET="..."                     # Random secret para NextAuth
AUTH_RESEND_KEY="re_..."              # API key de Resend
NEXT_PUBLIC_APP_URL="https://..."     # URL del deploy
AUTH_TRUST_HOST="true"                # Necesario en Vercel
```

---

## 9. ORDEN DE EJECUCIÓN PARA NUEVO SAAS

1. **Crear proyecto** Next.js con Tailwind
2. **Configurar DB** (Neon + Drizzle schema + `drizzle-kit push`)
3. **Configurar Auth** (NextAuth + Resend Magic Link)
4. **Agregar middleware** de protección de rutas
5. **Crear schema** con multi-tenancy (tenantId en todas las tablas)
6. **Implementar server actions** con validación de sesión
7. **Crear motor de riesgo** con factores específicos de la industria
8. **Crear templates legales** completos con variables dinámicas
9. **Crear UI** (intake form, dashboard, generador de contratos)
10. **Configurar deploy** (Vercel + env vars)
11. **Verificar** que todo persiste, auth funciona, rutas protegidas

---

## 10. ERRORES COMUNES A EVITAR

| Error | Por qué es grave | Cómo evitarlo |
|-------|------------------|---------------|
| Dos sistemas de auth | Las server actions no reconocen la sesión | Un solo sistema (NextAuth) |
| Passwords en texto plano | Vulnerabilidad crítica | Usar Magic Link o hashear con bcrypt |
| Sin middleware de rutas | Cualquiera accede sin login | Middleware que valide sesión |
| Templates legales genéricos | Sin valor legal real | Mínimo 12 cláusulas por contrato |
| Aviso de Privacidad incompleto | Incumplimiento LFPDPPP | Seguir checklist de 12 secciones |
| `console.log` en lugar de guardar | Datos se pierden | Siempre persistir en DB |
| Importar código servidor en cliente | `DATABASE_URL is not set` | Separar módulos cliente/servidor |
| Jurisdicción hardcodeada | No aplica a otros países | Usar variables dinámicas `{{JURISDICCION}}` |
| Sin `SessionProvider` | `useSession()` falla | Envolver app en `<Providers>` |
| Sin `AUTH_TRUST_HOST` en Vercel | Auth falla en producción | Agregar como env var |

---

*Documento generado: Febrero 2026*  
*Proyecto: Legal Shield SaaS - MakeFlowIA*
