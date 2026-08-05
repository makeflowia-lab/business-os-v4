# 🏗️ SaaS Legal Shield - Motor de Blindaje Contractual
## Pivote Estratégico: De "Analizador de Patentes" a "Motor de Blindaje SaaS"

### 🎯 Objetivo
Transformar la plataforma en un generador de contratos profesional, personalizado y listo para firma, enfocado en proteger al proveedor SaaS mediante lógica jurídica condicional.

### 📋 Módulos a Desarrollar

#### 1. Módulo A: Captura de Información (Intake Form)
- **Bloque 1: Proveedor (SaaS Vendor)**
  - Nombre Legal, Razón Social, RFC, Domicilio Fiscal, Representante Legal, Correo, Teléfono.
- **Bloque 2: Cliente (Recipient)**
  - Nombre/Razón Social, RFC, Domicilio, Representante, Correo.
- **Bloque 3: Especificaciones SaaS**
  - Nombre SaaS, Tipo de Servicio, Módulos incluidos, Jurisdicción.
- **Bloque 4: Flags de Riesgo y Operación**
  - Manejo de datos personales/sensibles.
  - Criticidad (Bajo/Medio/Alto).
  - SLA (Sí/No).
  - Facturación Electrónica (Sí/No).

#### 2. Módulo B: Motor de Ensamblaje Inteligente (Assembly Engine)
- Repositorio de 15 documentos base (cláusulas y contratos).
- Sistema de placeholders: `{{PROVEEDOR}}`, `{{CLIENTE}}`, `{{RFC_PROVEEDOR}}`, etc.
- Lógica condicional:
  - `IF datos_personales == TRUE THEN incluir(CLAUSULA_PRIVACIDAD)`
  - `IF criticidad == ALTO THEN incluir(RESPONSABILIDAD_REFUERZO)`
  - `IF sla == TRUE THEN incluir(ANEXO_SLA)`

#### 3. Módulo C: Generación y Salida
- Consolidación profesional (Numeración, Estructura, Índice).
- Exportación a PDF y DOCX.

---

### 📅 Fases de Implementación

| Fase | Acción | Resultado |
|------|--------|-----------|
| **1. Delimitación** | Actualizar `IntakeForm` con campos corporativos. | Formulario robusto de captura. |
| **2. Mapeo** | Definir los 15 documentos base en `knowledge-base.ts`. | Biblioteca de cláusulas estructurada. |
| **3. Ejecución** | Refactorizar `AgreementGenerator` con el motor de ensamblaje. | Contratos generados por lógica. |
| **4. Validación** | Pruebas de exportación y coherencia legal. | PDF/DOCX profesionales. |

---

### 🛠️ Seguimiento de Errores (Auto-Blindaje)
- *2026-02-13*: Pivote detectado. Reemplazo de lógica de patentamiento por lógica de blindaje contractual.
