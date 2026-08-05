'use client'

import { useState } from 'react'
import Link from 'next/link'

type Tab = 'mission' | 'proyectos' | 'automatizacion' | 'decisiones' | 'stack' | 'plan30'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'mission', label: 'Mission Control', icon: '🎯' },
  { id: 'proyectos', label: 'Gestión de Proyectos', icon: '📋' },
  { id: 'automatizacion', label: 'Automatización', icon: '⚙️' },
  { id: 'decisiones', label: 'Sistema de Decisiones', icon: '🧠' },
  { id: 'stack', label: 'Stack Tech', icon: '🔧' },
  { id: 'plan30', label: 'Plan 30 días', icon: '📅' },
]

export default function BusinessOSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('mission')

  return (
    <div className="h-screen overflow-y-auto doc-scroll bg-[#060810] text-[#e2e8f0]">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1a2744] bg-[#0d1117]/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#e2e8f0] transition-colors">
          ← Volver a Raziel
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 border-b border-[#1a2744] pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-1">Raziel — Business OS</p>
              <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-tight">Sistema Operativo de Negocio</h1>
              <p className="text-sm text-[#64748b] mt-1">Arquitectura de operaciones — Solo Founder · SaaS Factory · Etapa Arranque</p>
            </div>
            <button
              onClick={() => window.print()}
              className="text-[10px] px-3 py-2 border border-[#1a2744] hover:border-[#00d4ff]/40 text-[#475569] hover:text-[#00d4ff] rounded-lg transition-all duration-200 uppercase tracking-widest"
            >
              Exportar PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border
                ${activeTab === tab.id
                  ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]/40 text-[#0ea5e9]'
                  : 'border-[#1a2744] text-[#64748b] hover:text-[#94a3b8] hover:border-[#1a2744]'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── MISSION CONTROL ── */}
        {activeTab === 'mission' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#00d4ff]">🎯 Mission Control Dashboard</h2>
            <p className="text-sm text-[#94a3b8]">Vista única de todo el negocio. Revisión diaria: 15 minutos cada mañana.</p>

            {/* KPIs */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">KPIs Críticos — Semáforo Semanal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Clientes Activos', meta: '2-3', now: '0-1', color: 'red' },
                  { label: 'Propuestas Enviadas', meta: '2/semana', now: '1/semana', color: 'yellow' },
                  { label: 'Tiempo Intake → Propuesta', meta: '< 48h', now: 'manual', color: 'red' },
                  { label: 'Revenue Mensual', meta: '$3,000 USD', now: '$0', color: 'red' },
                  { label: 'Proyectos en Pipeline', meta: '3+', now: '0-1', color: 'yellow' },
                  { label: 'Tasa Cierre Propuestas', meta: '> 30%', now: 'sin datos', color: 'gray' },
                ].map((kpi) => (
                  <div key={kpi.label} className="p-4 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-2">{kpi.label}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-[#64748b]">Ahora: <span className="text-[#94a3b8]">{kpi.now}</span></p>
                        <p className="text-xs text-[#64748b]">Meta: <span className="text-[#00d4ff]">{kpi.meta}</span></p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        kpi.color === 'red' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]' :
                        kpi.color === 'yellow' ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.7)]' :
                        kpi.color === 'green' ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]' :
                        'bg-[#334155]'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Pipeline de Ventas — Etapas</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { stage: 'Lead', action: 'Contacto inicial recibido', color: '#334155' },
                  { stage: 'Calificado', action: 'Discovery call / formulario', color: '#1d4ed8' },
                  { stage: 'Propuesta', action: 'Doc técnico + precio enviado', color: '#0ea5e9' },
                  { stage: 'Negociación', action: 'Ajustes + contrato', color: '#f59e0b' },
                  { stage: 'Cerrado', action: 'Firma + pago inicial 50%', color: '#22c55e' },
                  { stage: 'Entrega', action: 'Desarrollo activo', color: '#a855f7' },
                ].map((s, i) => (
                  <div key={s.stage} className="flex-shrink-0 w-36 p-3 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <p className="text-xs font-semibold text-[#e2e8f0]">{s.stage}</p>
                    </div>
                    <p className="text-[10px] text-[#64748b] leading-relaxed">{s.action}</p>
                    <p className="text-[10px] text-[#334155] mt-2">#{i + 1}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Ritual */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Ritual Diario — 15 Minutos</h3>
              <div className="space-y-2">
                {[
                  { time: '5 min', action: 'Revisar inbox + mensajes de clientes. Responder solo urgentes.', id: 1 },
                  { time: '5 min', action: 'Actualizar estado del pipeline. ¿Algún lead que avanzar hoy?', id: 2 },
                  { time: '5 min', action: 'Elegir la UNA tarea de mayor impacto del día. Solo una.', id: 3 },
                ].map((r) => (
                  <div key={r.id} className="flex gap-4 p-3 rounded-xl border border-[#1a2744] bg-[#090c14]">
                    <span className="text-[#00d4ff] text-xs font-mono w-12 flex-shrink-0">{r.time}</span>
                    <p className="text-sm text-[#94a3b8]">{r.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GESTIÓN DE PROYECTOS ── */}
        {activeTab === 'proyectos' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#00d4ff]">📋 Sistema de Gestión de Proyectos</h2>
            <p className="text-sm text-[#94a3b8]">Kanban personalizado para un solo founder con múltiples proyectos simultáneos.</p>

            {/* Tipos de trabajo */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Tipos de Trabajo — Carriles Separados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    type: 'Proyectos de Cliente',
                    color: '#0ea5e9',
                    states: ['Intake', 'Propuesta', 'Aprobado', 'Desarrollo', 'Review', 'Entregado'],
                    template: 'Discovery → Propuesta técnica → Contrato → Kick-off → Sprints → Deploy → Handoff',
                  },
                  {
                    type: 'Producto Propio (Raziel / SaaS Factory)',
                    color: '#a855f7',
                    states: ['Idea', 'PRP', 'Desarrollo', 'Alpha', 'Beta', 'Lanzado'],
                    template: 'PRP → Skill creado → Feature → Test → Deploy → Docs',
                  },
                  {
                    type: 'Marketing / Contenido',
                    color: '#f59e0b',
                    states: ['Idea', 'Redacción', 'Diseño', 'Programado', 'Publicado', 'Analizado'],
                    template: 'Hook → Cuerpo → CTA → Imagen → Publicar → Registrar resultado',
                  },
                  {
                    type: 'Admin / Legal / Finanzas',
                    color: '#22c55e',
                    states: ['Pendiente', 'En proceso', 'Revisión', 'Listo'],
                    template: 'Tarea → Ejecutar → Archivar en carpeta del proyecto',
                  },
                ].map((t) => (
                  <div key={t.type} className="p-4 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      <p className="text-sm font-semibold text-[#e2e8f0]">{t.type}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {t.states.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded border border-[#1a2744] text-[#64748b]">{s}</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#475569] leading-relaxed">{t.template}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Templates recurrentes */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Templates de Proyectos Recurrentes</h3>
              <div className="space-y-3">
                {[
                  {
                    name: 'Template: Proyecto SaaS Completo',
                    steps: [
                      '[ ] Discovery call (30 min) → notas en Notion/archivo',
                      '[ ] Generar propuesta técnica con Raziel /propuesta',
                      '[ ] Enviar contrato (NDA + Contrato SaaS desde /legal)',
                      '[ ] Cobrar 50% inicial → confirmar inicio',
                      '[ ] Kick-off: definir stack, repos, entornos',
                      '[ ] Sprint 1 (1 semana): MVP funcional',
                      '[ ] Review con cliente → ajustes',
                      '[ ] Sprint 2: features + polish',
                      '[ ] Deploy producción + docs de handoff',
                      '[ ] Cobrar 50% restante',
                      '[ ] Soporte post-entrega (2 semanas)',
                    ],
                  },
                  {
                    name: 'Template: Landing + Onboarding Nuevo Cliente',
                    steps: [
                      '[ ] Recibir lead → responder en < 2h',
                      '[ ] Enviar formulario de intake (preguntas clave)',
                      '[ ] Calificar: presupuesto, urgencia, fit',
                      '[ ] Agendar llamada si califica',
                      '[ ] Enviar propuesta en < 48h post-llamada',
                    ],
                  },
                ].map((t) => (
                  <div key={t.name} className="p-4 rounded-xl border border-[#1a2744] bg-[#090c14]">
                    <p className="text-sm font-semibold text-[#94a3b8] mb-3">{t.name}</p>
                    <div className="space-y-1">
                      {t.steps.map((s) => (
                        <p key={s} className="text-xs font-mono text-[#64748b]">{s}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AUTOMATIZACIÓN ── */}
        {activeTab === 'automatizacion' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#00d4ff]">⚙️ Arquitectura de Automatización</h2>
            <p className="text-sm text-[#94a3b8]">Flujos críticos automatizados. Prioridad: el cuello de botella intake → propuesta.</p>

            {/* Flujos críticos */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Flujos de Alta Prioridad</h3>
              <div className="space-y-4">
                {[
                  {
                    priority: 'CRÍTICO',
                    color: 'red',
                    name: 'Intake → Propuesta Automática',
                    trigger: 'Lead llena formulario de contacto',
                    steps: [
                      '1. Formulario (Tally/Typeform gratuito) captura: nombre, empresa, presupuesto, urgencia, descripción',
                      '2. Webhook → Raziel API genera borrador de propuesta técnica automáticamente',
                      '3. Tú revisas y ajustas en < 30 min (no desde cero)',
                      '4. Envías en < 48h = ventaja competitiva brutal',
                    ],
                    saving: 'Ahorra: 3-5 horas por propuesta',
                  },
                  {
                    priority: 'ALTO',
                    color: 'yellow',
                    name: 'Onboarding de Cliente Cerrado',
                    trigger: 'Contrato firmado + pago recibido',
                    steps: [
                      '1. Crear repo en GitHub con template SaaS Factory',
                      '2. Invitar cliente a canal de comunicación (WhatsApp Business / Discord)',
                      '3. Enviar documento de kick-off (stack, entornos, fechas)',
                      '4. Agendar llamada de inicio',
                    ],
                    saving: 'Ahorra: 2h de setup por cliente',
                  },
                  {
                    priority: 'ALTO',
                    color: 'yellow',
                    name: 'Reporte Semanal Automático',
                    trigger: 'Viernes 6pm (cron o manual)',
                    steps: [
                      '1. Template fijo: ✅ Completado / 🔄 En proceso / 🚧 Bloqueado',
                      '2. Incluye: horas trabajadas, próximos pasos, preguntas al cliente',
                      '3. Enviar por WhatsApp o email',
                    ],
                    saving: 'Ahorra: 1h/semana + mantiene cliente informado = menos chasing',
                  },
                  {
                    priority: 'MEDIO',
                    color: 'blue',
                    name: 'Seguimiento de Pipeline',
                    trigger: 'Cada 48h si un lead no avanza',
                    steps: [
                      '1. Revisar pipeline cada mañana (ritual 5 min)',
                      '2. Si propuesta enviada hace +48h sin respuesta → follow-up automático',
                      '3. Template: "¿Tuviste oportunidad de revisar la propuesta? Estoy disponible para ajustar."',
                    ],
                    saving: 'Aumenta: tasa de cierre 10-20%',
                  },
                ].map((f) => (
                  <div key={f.name} className="p-5 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        f.color === 'red' ? 'bg-red-500/20 text-red-400' :
                        f.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{f.priority}</span>
                      <p className="text-sm font-semibold text-[#e2e8f0]">{f.name}</p>
                    </div>
                    <p className="text-xs text-[#475569] mb-3">Trigger: <span className="text-[#64748b]">{f.trigger}</span></p>
                    <div className="space-y-1 mb-3">
                      {f.steps.map((s) => (
                        <p key={s} className="text-xs text-[#94a3b8] leading-relaxed">{s}</p>
                      ))}
                    </div>
                    <p className="text-[10px] text-[#00d4ff]">{f.saving}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Herramientas sin código */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Stack de Automatización — Sin Código</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { tool: 'Tally.so', use: 'Formulario de intake gratuito, webhook incluido', tier: 'Gratis' },
                  { tool: 'Make (Integromat)', use: 'Automatizaciones entre herramientas, 1,000 ops/mes gratis', tier: 'Gratis' },
                  { tool: 'WhatsApp Business', use: 'Canal principal con clientes, plantillas de mensajes', tier: 'Gratis' },
                  { tool: 'Notion Free', use: 'CRM simple + gestión de proyectos hasta que escales', tier: 'Gratis' },
                ].map((t) => (
                  <div key={t.tool} className="flex gap-3 p-3 rounded-xl border border-[#1a2744] bg-[#090c14]">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#e2e8f0]">{t.tool}</p>
                      <p className="text-xs text-[#64748b] mt-0.5">{t.use}</p>
                    </div>
                    <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded h-fit">{t.tier}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SISTEMA DE DECISIONES ── */}
        {activeTab === 'decisiones' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#00d4ff]">🧠 Sistema de Decisiones</h2>
            <p className="text-sm text-[#94a3b8]">Frameworks para no perder tiempo en decisiones que no mueven el negocio.</p>

            {/* Matriz de priorización */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Matriz de Priorización — Eisenhower + ROI</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { q: 'URGENTE + ALTO ROI', label: 'HACER AHORA', color: '#22c55e', desc: 'Propuesta a cliente calificado, fix crítico en producción, cerrar contrato pendiente' },
                  { q: 'NO URGENTE + ALTO ROI', label: 'AGENDAR', color: '#0ea5e9', desc: 'Construir automatizaciones, crear contenido, mejorar SaaS Factory, desarrollar Raziel' },
                  { q: 'URGENTE + BAJO ROI', label: 'DELEGAR O HACER RÁPIDO', color: '#f59e0b', desc: 'Admin, responder mensajes no urgentes, facturas, burocracia' },
                  { q: 'NO URGENTE + BAJO ROI', label: 'ELIMINAR', color: '#ef4444', desc: 'Reuniones sin agenda, tareas sin cliente ni ROI claro, perfeccionar lo que ya funciona' },
                ].map((m) => (
                  <div key={m.q} className="p-4 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-1">{m.q}</p>
                    <p className="text-sm font-bold mb-2" style={{ color: m.color }}>{m.label}</p>
                    <p className="text-xs text-[#64748b] leading-relaxed">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reglas de decisión */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Reglas de Decisión — Solo Founder</h3>
              <div className="space-y-2">
                {[
                  { rule: 'La Regla del Dinero Primero', desc: 'Cualquier tarea que no acerque a un pago esta semana va al final de la lista. Sin excepción.' },
                  { rule: 'La Regla de las 48 horas', desc: 'Si una decisión no tiene consecuencias irreversibles, tómala en 48h o menos. No análisis infinito.' },
                  { rule: 'La Regla del Cliente Ideal', desc: 'Antes de aceptar un proyecto: ¿pagaría $3,000+ USD? ¿puedo entregarlo en < 4 semanas? Si no, no.' },
                  { rule: 'La Regla de la Energía', desc: 'El trabajo de mayor concentración (código, propuestas) va primero en el día. El admin va al final.' },
                  { rule: 'La Regla del No Activo', desc: '"No sé" = No. Aceptar proyectos por miedo a perder revenue es la ruina del solo founder.' },
                ].map((r) => (
                  <div key={r.rule} className="p-4 rounded-xl border border-[#1a2744] bg-[#090c14]">
                    <p className="text-sm font-semibold text-[#94a3b8] mb-1">{r.rule}</p>
                    <p className="text-xs text-[#64748b] leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Revisiones */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Cadencia de Revisión</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { freq: 'Semanal — Viernes', duration: '30 min', items: ['¿Qué funcionó esta semana?', '¿Qué no funcionó?', '¿Cuál es la prioridad #1 de la próxima semana?', 'Actualizar pipeline'] },
                  { freq: 'Mensual — Día 1', duration: '60 min', items: ['Revisar KPIs vs metas', 'Estado financiero (ingresos, gastos, flujo)', 'Ajustar estrategia si KPIs rojos', 'Próximos 30 días'] },
                  { freq: 'Trimestral', duration: '2 horas', items: ['Revisión completa de todos los módulos', 'Actualizar Raziel con nuevos aprendizajes', 'Validar que el cliente ideal sigue siendo el mismo', 'Subir precios si aplica'] },
                ].map((rev) => (
                  <div key={rev.freq} className="p-4 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <p className="text-sm font-semibold text-[#e2e8f0] mb-1">{rev.freq}</p>
                    <p className="text-[10px] text-[#00d4ff] mb-3">{rev.duration}</p>
                    <div className="space-y-1">
                      {rev.items.map((item) => (
                        <p key={item} className="text-xs text-[#64748b]">• {item}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STACK TECH ── */}
        {activeTab === 'stack' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#00d4ff]">🔧 Stack Tecnológico Recomendado</h2>
            <p className="text-sm text-[#94a3b8]">Basado en: presupuesto 100-500/mes · Solo founder · Stack Next.js · Etapa arranque</p>

            {/* Stack completo */}
            <div className="space-y-4">
              {[
                {
                  category: 'Comunicación con Clientes',
                  priority: 'HOY',
                  tools: [
                    { name: 'WhatsApp Business', role: 'Canal principal con clientes', cost: 'Gratis', why: 'Todos tus clientes ya lo tienen. Respuesta rápida = percepción profesional.' },
                    { name: 'Google Meet', role: 'Videollamadas discovery + demos', cost: 'Gratis', why: 'Sin fricción para el cliente. Graba automático.' },
                  ],
                },
                {
                  category: 'CRM + Gestión de Proyectos',
                  priority: 'HOY',
                  tools: [
                    { name: 'Notion Free', role: 'CRM simple + base de conocimiento + tareas', cost: 'Gratis', why: 'Un solo lugar para todo. Sube a Pro ($16/mes) cuando tengas +5 clientes.' },
                  ],
                },
                {
                  category: 'Formularios + Automatización',
                  priority: 'SEMANA 1',
                  tools: [
                    { name: 'Tally.so', role: 'Formulario de intake de clientes', cost: 'Gratis', why: 'Webhook nativo → conecta con Make para automatizar propuesta.' },
                    { name: 'Make (Integromat)', role: 'Automatizaciones sin código', cost: 'Gratis / $9 si escala', why: '1,000 ops/mes gratis. Conecta Tally → Notion → WhatsApp.' },
                  ],
                },
                {
                  category: 'Pagos',
                  priority: 'SEMANA 2',
                  tools: [
                    { name: 'Stripe', role: 'Cobros internacionales + recurrentes', cost: '2.9% + $0.30 por transacción', why: 'Estándar para SaaS. Facturas automáticas. API robusta.' },
                    { name: 'Clip (México)', role: 'Pagos locales en MXN', cost: '3.6% por transacción', why: 'Para clientes que prefieren pagar en pesos con tarjeta.' },
                  ],
                },
                {
                  category: 'Infraestructura (ya tienes)',
                  priority: 'ACTIVO',
                  tools: [
                    { name: 'Vercel', role: 'Deploy de apps Next.js', cost: 'Gratis (hobby) / $20 pro', why: 'CI/CD automático desde GitHub. Dominio .vercel.app incluido.' },
                    { name: 'Neon', role: 'PostgreSQL serverless', cost: 'Gratis hasta 0.5 GB', why: 'Sin servidor que administrar. Scale automático.' },
                    { name: 'OpenRouter', role: 'AI Engine para Raziel y clientes', cost: 'Pay per use', why: 'Acceso a Claude, GPT-4, Gemini en un solo API.' },
                  ],
                },
                {
                  category: 'Cuando escales (90+ días)',
                  priority: 'FUTURO',
                  tools: [
                    { name: 'Linear', role: 'Gestión de proyectos técnicos con equipo', cost: '$8/usuario/mes', why: 'Cuando tengas +1 colaborador. Mejor que Jira.' },
                    { name: 'Lemon Squeezy', role: 'Venta de productos digitales / SaaS', cost: '5% por transacción', why: 'Merchant of Record = tú no manejas impuestos internacionales.' },
                  ],
                },
              ].map((cat) => (
                <div key={cat.category} className="p-5 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-sm font-semibold text-[#e2e8f0]">{cat.category}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      cat.priority === 'HOY' ? 'bg-green-500/20 text-green-400' :
                      cat.priority === 'ACTIVO' ? 'bg-[#00d4ff]/20 text-[#00d4ff]' :
                      cat.priority === 'FUTURO' ? 'bg-[#334155] text-[#64748b]' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>{cat.priority}</span>
                  </div>
                  <div className="space-y-3">
                    {cat.tools.map((t) => (
                      <div key={t.name} className="flex gap-4 p-3 rounded-lg bg-[#090c14] border border-[#1a2744]">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-[#94a3b8]">{t.name}</p>
                            <span className="text-[10px] text-[#475569]">{t.cost}</span>
                          </div>
                          <p className="text-xs text-[#64748b] mb-1">{t.role}</p>
                          <p className="text-[10px] text-[#475569] italic">{t.why}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Costo total */}
            <div className="p-5 rounded-xl border border-[#00d4ff]/20 bg-[#00d4ff]/5">
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Costo Mensual Real — Arranque</h3>
              <div className="space-y-2">
                {[
                  { item: 'WhatsApp Business + Google Meet', cost: '$0' },
                  { item: 'Notion Free', cost: '$0' },
                  { item: 'Tally + Make (plan gratis)', cost: '$0' },
                  { item: 'Vercel Hobby + Neon Free', cost: '$0' },
                  { item: 'OpenRouter (pay per use)', cost: '~$5-15/mes' },
                  { item: 'Stripe (solo cuando vendes)', cost: '% sobre ventas' },
                ].map((c) => (
                  <div key={c.item} className="flex justify-between text-xs">
                    <span className="text-[#94a3b8]">{c.item}</span>
                    <span className="text-[#00d4ff] font-mono">{c.cost}</span>
                  </div>
                ))}
                <div className="border-t border-[#1a2744] pt-2 mt-2 flex justify-between text-sm">
                  <span className="text-[#e2e8f0] font-semibold">Total fijo mensual</span>
                  <span className="text-[#00d4ff] font-bold">~$5-15 USD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PLAN 30 DÍAS ── */}
        {activeTab === 'plan30' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#00d4ff]">📅 Plan de Implementación — 30 Días</h2>
            <p className="text-sm text-[#94a3b8]">De 0 sistema a Business OS operativo. Una semana a la vez.</p>

            <div className="space-y-5">
              {[
                {
                  week: 'Semana 1',
                  theme: 'Fundamentos del Sistema',
                  color: '#ef4444',
                  days: '1-7',
                  tasks: [
                    { day: 'Día 1-2', task: 'Crear workspace en Notion: CRM + Pipeline + Proyectos', done: false },
                    { day: 'Día 2-3', task: 'Configurar formulario de intake en Tally con las 8 preguntas clave', done: false },
                    { day: 'Día 3-4', task: 'Crear cuenta Make + conectar Tally → Notion automáticamente', done: false },
                    { day: 'Día 5-6', task: 'Configurar WhatsApp Business con perfil profesional + respuesta rápida', done: false },
                    { day: 'Día 7', task: 'Prueba completa del flujo: lead → formulario → Notion → notificación', done: false },
                  ],
                  checkpoint: 'Pipeline activo. Primer lead puede entrar de forma ordenada.',
                },
                {
                  week: 'Semana 2',
                  theme: 'Activar Flujo de Ventas',
                  color: '#f59e0b',
                  days: '8-14',
                  tasks: [
                    { day: 'Día 8-9', task: 'Configurar Stripe + crear primer link de pago para servicios', done: false },
                    { day: 'Día 10', task: 'Crear template de reporte semanal (copiar + completar cada viernes)', done: false },
                    { day: 'Día 11-12', task: 'Publicar 3 posts de contenido (LinkedIn / X): expertise técnico', done: false },
                    { day: 'Día 13', task: 'Contactar 10 leads potenciales: ex-compañeros, conocidos con negocio', done: false },
                    { day: 'Día 14', task: 'Revisión semanal #1: ¿qué ajustar?', done: false },
                  ],
                  checkpoint: 'Primeras conversaciones con leads. Stripe listo para cobrar.',
                },
                {
                  week: 'Semana 3',
                  theme: 'Primera Propuesta → Primer Cierre',
                  color: '#0ea5e9',
                  days: '15-21',
                  tasks: [
                    { day: 'Día 15-16', task: 'Enviar propuesta a 2+ leads usando /propuesta de Raziel', done: false },
                    { day: 'Día 17-18', task: 'Follow-up automático con template → persistir sin molestar', done: false },
                    { day: 'Día 19-20', task: 'Si hay cierre: onboarding completo con el template de Raziel', done: false },
                    { day: 'Día 21', task: 'Revisión semanal #2 + ajuste de precios si el mercado responde', done: false },
                  ],
                  checkpoint: 'Meta: 1 propuesta aceptada o 1 cliente activo.',
                },
                {
                  week: 'Semana 4',
                  theme: 'Sistematizar lo que Funcionó',
                  color: '#22c55e',
                  days: '22-30',
                  tasks: [
                    { day: 'Día 22-23', task: 'Documentar el playbook de ventas (qué mensaje funcionó, qué objeción sale más)', done: false },
                    { day: 'Día 24-25', task: 'Optimizar formulario de intake basado en las conversaciones reales', done: false },
                    { day: 'Día 26-27', task: 'Crear caso de estudio del primer proyecto (texto + resultados)', done: false },
                    { day: 'Día 28-29', task: 'Publicar caso de estudio → nuevo contenido de atracción', done: false },
                    { day: 'Día 30', task: 'Revisión mensual completa: KPIs, ajustes, plan de los próximos 30 días', done: false },
                  ],
                  checkpoint: 'Sistema documentado. Listo para repetir y escalar.',
                },
              ].map((week) => (
                <div key={week.week} className="p-5 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: week.color }} />
                    <div>
                      <p className="text-sm font-bold text-[#e2e8f0]">{week.week} — Días {week.days}</p>
                      <p className="text-xs text-[#64748b]">{week.theme}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {week.tasks.map((t) => (
                      <div key={t.task} className="flex gap-3 items-start">
                        <span className="text-[10px] font-mono text-[#475569] w-16 flex-shrink-0 pt-0.5">{t.day}</span>
                        <p className="text-xs text-[#94a3b8] leading-relaxed">{t.task}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#1a2744] pt-3">
                    <p className="text-[10px] uppercase tracking-widest text-[#475569] mb-1">Checkpoint</p>
                    <p className="text-xs" style={{ color: week.color }}>{week.checkpoint}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Métricas de éxito */}
            <div className="p-5 rounded-xl border border-[#00d4ff]/20 bg-[#00d4ff]/5">
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-4">Métricas de Éxito — Día 30</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { metric: 'Leads en pipeline', target: '5+' },
                  { metric: 'Propuestas enviadas', target: '3+' },
                  { metric: 'Clientes activos', target: '1+' },
                  { metric: 'Revenue generado', target: '$1,500+ USD' },
                ].map((m) => (
                  <div key={m.metric} className="text-center">
                    <p className="text-2xl font-bold text-[#00d4ff]">{m.target}</p>
                    <p className="text-[10px] text-[#475569] mt-1">{m.metric}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#1a2744] text-center">
          <p className="text-[10px] text-[#334155] uppercase tracking-widest">
            Raziel Business OS — Generado para: Solo Founder · SaaS Factory · Arranque 2026
          </p>
        </div>
      </div>
    </div>
  )
}
