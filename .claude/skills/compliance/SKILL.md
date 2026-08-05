---
name: compliance
description: |
  Genera el cumplimiento legal/privacidad que la fabrica olvidaba: politica de privacidad,
  terminos y condiciones, consentimiento de cookies, flujo de borrado de datos (derecho al
  olvido), aviso de privacidad MX (LFPDPPP), y banners de consentimiento para datos sensibles
  (biometria). CRITICO para apps que procesan datos personales o biometricos. Usar antes de
  cualquier deploy que recolecte datos de usuarios reales.
  Triggers: politica de privacidad, terminos y condiciones, aviso de privacidad, GDPR, LFPDPPP,
  consentimiento, cookies, borrado de datos, derecho al olvido, compliance, cumplimiento legal,
  datos biometricos, datos sensibles, privacidad, proteccion de datos, legal.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Compliance — Cumplimiento Legal y Privacidad Automatico

> La fabrica construye apps que recolectan datos (¡biometricos en captura-facial!) pero nunca
> generaba el cumplimiento. Esto es un riesgo legal real. Ningun SaaS que toque datos
> personales debe deployarse sin esta capa.

---

## Cuando es OBLIGATORIO (no opcional)

| La app... | Necesita compliance |
|-----------|---------------------|
| Tiene login / recolecta emails | SI — privacidad + terminos |
| Procesa biometria (rostro, huella) | SI — consentimiento explicito reforzado |
| Cobra (Polar/pagos) | SI — terminos + reembolsos + facturacion |
| Guarda datos sensibles (legal, salud) | SI — privacidad reforzada + retencion |
| Usa cookies/analytics | SI — banner de consentimiento |

Regla: si hay `add-login`, `add-payments`, o cualquier dato de usuario → corre compliance
antes del deploy.

---

## Que genera

### 1. Politica de privacidad (`/privacidad`)
- Que datos se recolectan, para que, base legal, cuanto se retienen.
- Derechos ARCO (Acceso, Rectificacion, Cancelacion, Oposicion) — marco MX/LFPDPPP.
- Equivalente GDPR si hay usuarios UE.
- Contacto del responsable de datos.

### 2. Terminos y condiciones (`/terminos`)
- Uso permitido, limitacion de responsabilidad, propiedad intelectual.
- Si cobra: condiciones de pago, reembolsos, cancelacion.

### 3. Aviso de privacidad MX (LFPDPPP)
- Aviso corto (en formularios) + aviso integral (pagina completa).
- Obligatorio en Mexico para cualquier recoleccion de datos personales.

### 4. Consentimiento de cookies
- Banner con opciones (necesarias / analytics / marketing).
- No cargar analytics antes del consentimiento.

### 5. Consentimiento de datos sensibles / biometricos (REFORZADO)
Para `captura-facial` y similares:
- Consentimiento EXPLICITO y separado antes de capturar biometria.
- Explicacion clara: que se captura, donde se guarda, cuanto tiempo, como se borra.
- Opt-in activo (nunca preseleccionado).

### 6. Flujo de borrado de datos (derecho al olvido)
- Endpoint/flujo para que el usuario solicite borrado de su cuenta y datos.
- Borrado real en Supabase (auth + tablas relacionadas + storage).
- Confirmacion al usuario.

---

## Como se implementa

### Paso 1 — Detectar que datos toca la app
Escanear: hay `add-login`? `add-payments`? tablas con datos personales? captura biometrica?
analytics/cookies? Esto define que documentos se necesitan.

### Paso 2 — Generar las paginas
Crear en `src/app/(legal)/`:
```
(legal)/
├── privacidad/page.tsx
├── terminos/page.tsx
└── aviso-privacidad/page.tsx
```
Plantillas parametrizadas con `{{nombre_empresa}}`, `{{contacto}}`, `{{datos_recolectados}}`.

### Paso 3 — Componentes de consentimiento
- `shared/components/CookieConsent.tsx` (banner).
- `shared/components/BiometricConsent.tsx` (si aplica) — gate antes de capturar.

### Paso 4 — Flujo de borrado
- Ruta `app/api/account/delete/route.ts` + boton en settings.
- Borrado en cascada respetando RLS.

### Paso 5 — Enlazar en footer + signup
Links a privacidad/terminos en el footer y checkbox de aceptacion en el signup.

---

## Disclaimer (importante)

Esta skill genera plantillas SOLIDAS basadas en LFPDPPP/GDPR, pero **no sustituye asesoria
legal profesional**. Para apps de alto riesgo (biometria, salud, menores), recomendar al
usuario revision por un abogado. Decirlo explicitamente, no asumir.

---

## Reglas de Oro

1. **Sin compliance no hay deploy con datos reales.** Es un gate, no un extra.
2. **Biometria = consentimiento reforzado y separado.** Opt-in explicito, nunca preseleccionado.
3. **El borrado debe ser real.** Derecho al olvido = datos efectivamente eliminados.
4. **Analytics despues del consentimiento.** Nunca cookies de tracking antes del opt-in.
5. **Plantilla solida, no asesoria legal.** Recomendar abogado en casos de alto riesgo.
