# 🧠 Raziel Business OS — Arquitectura de Automatización 80%

> *"La diferencia entre un operador y un dueño es el sistema que los separa del caos."*

Este documento define la implementación del **Business OS** en este repositorio, siguiendo las 5 capas de la metodología Raziel.

## 🏗️ Las 5 Capas del Sistema

### 1. Contexto (Cerebro)
*   **Estado:** Implementado en `CLAUDE.md` y `GEMINI.md`.
*   **Función:** Proporcionar al agente (Raziel/Antigravity) la memoria perfecta de la misión, valores y reglas de oro del negocio.
*   **Regla de Oro:** Cada error detectado debe ser documentado en el sistema de **Auto-Blindaje** para que nunca vuelva a ocurrir.

### 2. Datos (Capa de Conexión)
*   **Estado:** Integrando Neon (PostgreSQL).
*   **Skill:** `.claude/skills/neon-mission-control.md`
*   **Función:** Acceso en lenguaje natural a métricas, usuarios y transacciones sin necesidad de abrir dashboards externos.

### 3. Inteligencia (Síntesis)
*   **Estado:** Nuevo.
*   **Skill:** `.claude/skills/morning-briefing.md`
*   **Función:** Generación automática de resúmenes diarios (Morning Briefing). Analiza qué pasó mientras dormías: ventas, emails, mensajes y KPIs.

### 4. Automatización (Agentes)
*   **Estado:** En desarrollo.
*   **Directorio:** `.claude/agents/`
*   **Función:** Rutinas autónomas (Crons) que ejecutan tareas repetitivas: limpieza de DB, reportes semanales, y seguimiento de leads.

### 5. Skills (Herramientas Propietarias)
*   **Estado:** Migrando de templates.
*   **Directorio:** `.claude/skills/`
*   **Skills Activas:**
    *   `habit-tracker`: Gestión de rutinas personales del fundador.
    *   `content-generator`: Automatización de guiones y miniaturas para YouTube.
    *   `neon-query`: Consultas directas a la base de datos empresarial.

---

## 🚀 Objetivo 80%
El sistema está configurado para que el **80% de las tareas operativas** (análisis de datos, reportes, gestión de base de datos, planificación de agenda) sean realizadas por el agente, dejando al humano el 20% de decisión estratégica y creativa.

## 🛡️ Auto-Blindaje
Cualquier fallo en el proceso debe ser reportado y la solución integrada en los prompts del sistema. **El Business OS no se compra, se construye.**
