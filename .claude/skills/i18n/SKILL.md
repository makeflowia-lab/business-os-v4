---
name: i18n
description: |
  Internacionalizacion LatAm-first desde dia uno: es-MX por default, en-US listo para activar,
  extraccion de strings, routing localizado y formato de fechas/numeros/moneda por locale.
  La fabrica construia en espanol hardcodeado; el dia que un cliente pide ingles o quieres
  expandir, es retrabajo. Usar al inicio de un proyecto o antes de expandir a otro idioma/pais.
  Triggers: i18n, internacionalizacion, multi-idioma, traduccion, ingles, en-US, locales,
  idiomas, expandir a otro pais, localizacion, moneda, formato de fecha, traducir la app,
  bilingue.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# i18n — Internacionalizacion LatAm-First

> Construir con strings hardcodeados en espanol es deuda. El dia que llega un cliente en
> ingles o quieres otro pais, hay que reescribir media app. i18n lo previene desde dia uno.

---

## El principio: extraible desde el inicio, traducible despues

No traducir todo de golpe. La clave es ESTRUCTURAR para que traducir sea trivial cuando
haga falta:
- Default `es-MX` (tu mercado).
- Strings fuera del JSX, en diccionarios.
- `en-US` listo para activar sin tocar componentes.

---

## Stack (Golden Path para Next.js 16 App Router)

- **next-intl** (o el routing i18n nativo de Next): locales en el segmento de ruta.
- Estructura:
```
src/
├── i18n/
│   ├── config.ts            (locales: es-MX default, en-US)
│   ├── messages/
│   │   ├── es-MX.json
│   │   └── en-US.json
│   └── request.ts
├── app/
│   └── [locale]/            (rutas con locale)
│       └── ...
```

---

## Los 4 frentes de localizacion

### 1. Strings de UI
- Extraer todo texto visible a `messages/es-MX.json` con claves semanticas.
- Componentes usan `t('clave')`, nunca texto literal.

### 2. Formato (fecha, numero, moneda)
- Fechas: `Intl.DateTimeFormat(locale)`.
- Moneda: MXN por default, formateada por locale.
- Numeros: separadores correctos por region.

### 3. Routing y SEO localizado
- `/es-MX/...` y `/en-US/...` con `hreflang` correcto.
- `generateMetadata` localizado por idioma (importante para SEO — se conecta con acquisition).

### 4. Contenido dinamico
- Si hay contenido en BD que se traduce, columnas o tabla de traducciones por locale.

---

## Como se implementa

### Proyecto nuevo (ideal)
1. Instalar next-intl + estructura `i18n/`.
2. Default es-MX, extraer strings a medida que se construye.
3. en-US queda como JSON espejo (se llena cuando se necesite).

### Proyecto existente (retrofit)
1. Escanear strings hardcodeados (Grep de texto en JSX).
2. Extraerlos a `es-MX.json` con claves.
3. Reemplazar literales por `t('clave')`.
4. Envolver rutas en `[locale]`.
5. Probar que es-MX se ve identico (cero regresion visual).

---

## Integracion

- **acquisition:** SEO localizado (hreflang, metadata por idioma) multiplica alcance.
- **website-3d / landing:** copy AIDA/PAS por locale.
- **factory-brain:** registra que la i18n es default del Golden Path V5.

---

## Reglas de Oro

1. **Extraible desde dia uno.** Strings en diccionarios, no en JSX.
2. **es-MX default, en-US espejo.** No traducir todo ya; estructurar para traducir facil.
3. **Formato por locale.** Fecha/moneda/numero respetan la region.
4. **SEO localizado.** hreflang + metadata por idioma (se conecta con acquisition).
5. **Retrofit sin regresion.** Si localizas algo existente, es-MX debe verse identico.
