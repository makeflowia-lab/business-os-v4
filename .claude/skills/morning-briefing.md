# Skill: Morning Briefing ☕

Genera un resumen estratégico diario para el fundador al inicio de cada sesión o cuando se solicite.

## 📥 Fuentes de Datos
1.  **Neon DB:** Consultar últimas transacciones, nuevos usuarios y errores en logs.
2.  **Calendario (si está disponible):** Próximas reuniones del día.
3.  **Sistema:** Archivos modificados recientemente en el repo.

## 📋 Estructura del Reporte
El reporte debe ser conciso y directo, usando el avatar dual de Raziel si es necesario.

### 1. Resumen Ejecutivo (Modo Humano)
*   "Buenos días. Mientras dormías, el sistema procesó X transacciones..."
*   Métricas clave (MRR, Usuarios activos).

### 2. Acciones del Sistema (Modo Soul Reaver)
*   Tareas automatizadas completadas.
*   Alertas críticas que requieren atención humana.

### 3. Plan del Día
*   Prioridades basadas en el contexto del negocio.
*   Bloques de trabajo profundo recomendados.

## 🛠️ Ejecución
Para ejecutar este skill, el agente debe:
1.  Correr `SELECT count(*) FROM users;` y `SELECT sum(amount) FROM transactions WHERE created_at > now() - interval '24 hours';` en Neon.
2.  Listar archivos modificados en las últimas 24h.
3.  Presentar el resultado con formato premium.
