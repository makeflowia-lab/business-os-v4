'use client'

import { useState } from 'react'
import Link from 'next/link'

type Tab = 'salud' | 'pricing' | 'runway' | 'kpis' | 'tracker' | 'estrategia'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'salud', label: 'Salud Financiera', icon: '💊' },
  { id: 'pricing', label: 'Modelo de Pricing', icon: '💰' },
  { id: 'runway', label: 'Runway & Breakeven', icon: '🛫' },
  { id: 'kpis', label: 'KPIs Financieros', icon: '📊' },
  { id: 'tracker', label: 'Tracker de Ingresos', icon: '📈' },
  { id: 'estrategia', label: 'Estrategia 90 días', icon: '🎯' },
]

export default function CFOPage() {
  const [activeTab, setActiveTab] = useState<Tab>('salud')

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
              <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-1">Raziel — CFO Virtual</p>
              <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-tight">Análisis Financiero</h1>
              <p className="text-sm text-[#64748b] mt-1">
                Solo Founder · SaaS Dev Services + Producto Propio · Etapa Pre-Revenue → Arranque
              </p>
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
                  : 'border-[#1a2744] text-[#64748b] hover:text-[#94a3b8]'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── SALUD FINANCIERA ── */}
        {activeTab === 'salud' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#00d4ff]">💊 Diagnóstico de Salud Financiera</h2>

            {/* Estado actual */}
            <div className="p-5 rounded-xl border border-yellow-500/30 bg-yellow-500/5">
              <p className="text-xs uppercase tracking-widest text-yellow-400 mb-2">Estado Actual — Etapa Pre-Revenue</p>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                Estructura de costos casi en cero ($10-15 USD/mes). Sin historial financiero formal.
                Esta es la posición ideal para construir sobre bases correctas desde el día 1 —
                sin deudas, sin compromisos, máxima flexibilidad estratégica.
              </p>
            </div>

            {/* Costos actuales */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Estructura de Costos Actual</h3>
              <div className="space-y-2">
                {[
                  { item: 'OpenRouter (AI Engine)', type: 'Variable', amount: '~$10-15 USD/mes', status: 'activo' },
                  { item: 'Vercel Hobby', type: 'Fijo', amount: '$0', status: 'activo' },
                  { item: 'Neon Free', type: 'Fijo', amount: '$0', status: 'activo' },
                  { item: 'GitHub Free', type: 'Fijo', amount: '$0', status: 'activo' },
                  { item: 'Herramientas (Tally, Make, Notion)', type: 'Fijo', amount: '$0', status: 'activo' },
                  { item: 'Dominio (cuando aplique)', type: 'Anual', amount: '~$12-15 USD/año', status: 'pendiente' },
                ].map((c) => (
                  <div key={c.item} className="flex items-center gap-4 p-3 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <div className="flex-1">
                      <p className="text-sm text-[#94a3b8]">{c.item}</p>
                      <p className="text-[10px] text-[#475569]">{c.type}</p>
                    </div>
                    <span className="text-sm font-mono text-[#e2e8f0]">{c.amount}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      c.status === 'activo' ? 'bg-green-500/20 text-green-400' : 'bg-[#334155] text-[#64748b]'
                    }`}>{c.status}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#00d4ff]/20 bg-[#00d4ff]/5 mt-2">
                  <span className="text-sm font-semibold text-[#e2e8f0]">Total mensual fijo</span>
                  <span className="text-lg font-bold text-[#00d4ff] font-mono">~$15 USD</span>
                </div>
              </div>
            </div>

            {/* Semáforo de salud */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Semáforo de Salud — Indicadores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { indicator: 'Burn rate mensual', value: '~$15 USD', status: 'green', note: 'Casi inexistente. Ventaja táctica máxima.' },
                  { indicator: 'Revenue mensual', value: '$0', status: 'red', note: 'Prioridad #1: primer ingreso en < 30 días.' },
                  { indicator: 'Margen bruto proyectado', value: '85-90%', status: 'green', note: 'Negocio de servicios digitales = margen alto.' },
                  { indicator: 'Dependencia de un cliente', value: 'N/A', status: 'gray', note: 'En cuanto entre el primer cliente, diversificar.' },
                  { indicator: 'Deuda operativa', value: '$0', status: 'green', note: 'Cero compromisos financieros. Arranque limpio.' },
                  { indicator: 'Concentración de riesgo', value: 'Solo founder', status: 'yellow', note: 'El negocio depende 100% de tu tiempo. Automatizar.' },
                ].map((s) => (
                  <div key={s.indicator} className="p-4 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs text-[#64748b] uppercase tracking-widest">{s.indicator}</p>
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${
                        s.status === 'green' ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]' :
                        s.status === 'red' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]' :
                        s.status === 'yellow' ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.7)]' :
                        'bg-[#334155]'
                      }`} />
                    </div>
                    <p className="text-xl font-bold text-[#e2e8f0] font-mono mb-1">{s.value}</p>
                    <p className="text-[10px] text-[#475569] leading-relaxed">{s.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#00d4ff]">💰 Modelo de Pricing</h2>
            <p className="text-sm text-[#94a3b8]">Estructura de precios para: servicios de desarrollo SaaS + producto propio Raziel.</p>

            {/* Servicios de desarrollo */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Tier 1 — Servicios de Desarrollo</h3>
              <div className="space-y-3">
                {[
                  {
                    tier: 'MVP Rápido',
                    price: '$1,500 – $2,500 USD',
                    duration: '2-3 semanas',
                    includes: [
                      'App Next.js con auth (Supabase)',
                      'Hasta 5 páginas / módulos',
                      'Deploy en Vercel + dominio',
                      '2 semanas soporte post-entrega',
                    ],
                    ideal: 'Startups en validación, primera versión de producto',
                    payment: '50% inicio / 50% entrega',
                  },
                  {
                    tier: 'SaaS Completo',
                    price: '$3,500 – $6,000 USD',
                    duration: '4-6 semanas',
                    includes: [
                      'App completa con dashboard',
                      'Auth + pagos (Stripe)',
                      'Panel admin + roles',
                      'AI features (si aplica)',
                      'Deploy + CI/CD configurado',
                      '4 semanas soporte post-entrega',
                    ],
                    ideal: 'Empresas con tracción, productos con usuarios reales',
                    payment: '50% inicio / 25% mid / 25% entrega',
                  },
                  {
                    tier: 'Retainer Mensual',
                    price: '$800 – $1,500 USD/mes',
                    duration: 'Recurrente',
                    includes: [
                      'Hasta 40h/mes de desarrollo',
                      'Features + mantenimiento + soporte',
                      'Reunión semanal de sincronización',
                      'Prioridad de respuesta < 4h',
                    ],
                    ideal: 'Clientes con productos en producción que necesitan evolución continua',
                    payment: 'Mensual por anticipado',
                  },
                ].map((t) => (
                  <div key={t.tier} className="p-5 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-base font-bold text-[#e2e8f0]">{t.tier}</p>
                        <p className="text-[10px] text-[#475569]">{t.duration} · {t.payment}</p>
                      </div>
                      <p className="text-lg font-bold text-[#00d4ff] font-mono text-right">{t.price}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#475569] mb-2">Incluye</p>
                        <div className="space-y-1">
                          {t.includes.map((i) => (
                            <p key={i} className="text-xs text-[#94a3b8]">✓ {i}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#475569] mb-2">Cliente Ideal</p>
                        <p className="text-xs text-[#64748b] leading-relaxed">{t.ideal}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Producto Raziel */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Tier 2 — Producto Propio (Raziel · Futuro)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { plan: 'Starter', price: '$29/mes', users: '1 usuario', features: ['Acceso a todos los módulos', 'Chat con Raziel', 'Export PDF', 'Hasta 500 mensajes/mes'] },
                  { plan: 'Pro', price: '$79/mes', users: 'Hasta 3 usuarios', features: ['Todo lo de Starter', 'Historial ilimitado', 'Integración WhatsApp', 'Soporte prioritario'] },
                  { plan: 'Agency', price: '$199/mes', users: 'Hasta 10 usuarios', features: ['Todo lo de Pro', 'Branding personalizado', 'API access', 'Onboarding dedicado'] },
                ].map((p) => (
                  <div key={p.plan} className={`p-4 rounded-xl border bg-[#0d1117] ${
                    p.plan === 'Pro' ? 'border-[#00d4ff]/40' : 'border-[#1a2744]'
                  }`}>
                    {p.plan === 'Pro' && (
                      <p className="text-[10px] text-[#00d4ff] uppercase tracking-widest mb-2">Popular</p>
                    )}
                    <p className="text-base font-bold text-[#e2e8f0] mb-0.5">{p.plan}</p>
                    <p className="text-xl font-bold text-[#00d4ff] font-mono mb-1">{p.price}</p>
                    <p className="text-[10px] text-[#475569] mb-3">{p.users}</p>
                    <div className="space-y-1">
                      {p.features.map((f) => (
                        <p key={f} className="text-xs text-[#64748b]">• {f}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#334155] mt-2 text-center">
                Raziel como producto: lanzar cuando tengas 3+ proyectos entregados para validar el pitch con prueba social real.
              </p>
            </div>

            {/* Reglas de pricing */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Reglas de Pricing — No Negociables</h3>
              <div className="space-y-2">
                {[
                  { rule: 'Nunca cobres por hora', why: 'Cobrar por hora penaliza tu eficiencia. A más rápido trabajas, menos ganas. Cobra por valor entregado.' },
                  { rule: 'Siempre 50% por adelantado', why: 'Filtra clientes no serios, cubre tus costos, alinea el compromiso desde el día 1.' },
                  { rule: 'Precio mínimo: $1,500 USD', why: 'Por debajo de eso, el costo de oportunidad es mayor que el ingreso. No lo hagas.' },
                  { rule: 'Sube precios cada trimestre', why: 'Si todos aceptan tu precio a la primera, estás cobrando de menos. El rechazo calibra el mercado.' },
                  { rule: 'Descuentos solo por pago completo adelantado', why: '15% de descuento si pagan el 100% antes de empezar. Tú ganas flujo, ellos ahorran.' },
                ].map((r) => (
                  <div key={r.rule} className="p-4 rounded-xl border border-[#1a2744] bg-[#090c14]">
                    <p className="text-sm font-semibold text-[#94a3b8] mb-1">{r.rule}</p>
                    <p className="text-xs text-[#64748b] leading-relaxed">{r.why}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RUNWAY & BREAKEVEN ── */}
        {activeTab === 'runway' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#00d4ff]">🛫 Runway & Breakeven</h2>
            <p className="text-sm text-[#94a3b8]">
              Cuánto tiempo tienes y qué necesitas para ser rentable. Basado en estructura de costos actual.
            </p>

            {/* Burn rate */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Burn Rate del Negocio</h3>
              <div className="p-5 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div>
                    <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-1">Mensual</p>
                    <p className="text-2xl font-bold text-[#e2e8f0] font-mono">$15</p>
                    <p className="text-[10px] text-[#64748b]">USD</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-1">Trimestral</p>
                    <p className="text-2xl font-bold text-[#e2e8f0] font-mono">$45</p>
                    <p className="text-[10px] text-[#64748b]">USD</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-1">Anual</p>
                    <p className="text-2xl font-bold text-[#e2e8f0] font-mono">$180</p>
                    <p className="text-[10px] text-[#64748b]">USD</p>
                  </div>
                </div>
                <div className="border-t border-[#1a2744] pt-4">
                  <p className="text-xs text-[#64748b] text-center">
                    El burn rate del negocio es casi cero. El runway real lo define tu situación personal,
                    no los costos del negocio. Ventaja crítica en etapa de arranque.
                  </p>
                </div>
              </div>
            </div>

            {/* Breakeven */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Punto de Breakeven — Por Escenario</h3>
              <div className="space-y-3">
                {[
                  {
                    scenario: 'Solo costos del negocio',
                    projects: 1,
                    price: '$1,500 USD',
                    monthly: '$15',
                    margin: '99%',
                    color: '#22c55e',
                    note: 'Un solo proyecto cubre todo el año de operación.',
                  },
                  {
                    scenario: 'Con gastos personales básicos (~$800 USD/mes)',
                    projects: 1,
                    price: '$1,500 USD',
                    monthly: '$800',
                    margin: '46%',
                    color: '#f59e0b',
                    note: '1 proyecto MVP cada 2 meses cubre el breakeven personal.',
                  },
                  {
                    scenario: 'Con gastos personales cómodos (~$1,500 USD/mes)',
                    projects: 2,
                    price: '$1,500 USD',
                    monthly: '$1,500',
                    margin: '0%',
                    color: '#ef4444',
                    note: '1 proyecto SaaS Completo ($3,500) al mes = cómodo + reinversión.',
                  },
                ].map((s) => (
                  <div key={s.scenario} className="p-4 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <p className="text-sm font-semibold text-[#e2e8f0] mb-3">{s.scenario}</p>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center">
                        <p className="text-[10px] text-[#475569] mb-1">Burn mensual</p>
                        <p className="text-base font-bold font-mono" style={{ color: s.color }}>{s.monthly} USD</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-[#475569] mb-1">Proyectos mínimos</p>
                        <p className="text-base font-bold font-mono text-[#e2e8f0]">{s.projects} / mes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-[#475569] mb-1">Margen bruto</p>
                        <p className="text-base font-bold font-mono" style={{ color: s.color }}>{s.margin}</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#64748b]">{s.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta de ingresos */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Progresión de Ingresos — Hoja de Ruta</h3>
              <div className="space-y-2">
                {[
                  { phase: 'Mes 1', target: '$1,500 USD', how: '1 proyecto MVP. Cobrado. Entregado.', milestone: 'Primer ingreso real', status: 'objetivo' },
                  { phase: 'Mes 2-3', target: '$3,000 USD', how: '1 proyecto SaaS Completo o 2 MVPs en paralelo', milestone: 'Cobertura personal básica', status: 'objetivo' },
                  { phase: 'Mes 4-6', target: '$5,000 USD', how: '1 SaaS + 1 retainer mensual. Pipeline activo.', milestone: 'Negocio estable', status: 'meta' },
                  { phase: 'Mes 7-12', target: '$8,000 USD', how: '2 retainers + 1 proyecto nuevo + ingresos Raziel', milestone: 'Escalabilidad sin tiempo lineal', status: 'vision' },
                ].map((p) => (
                  <div key={p.phase} className="flex gap-4 p-4 rounded-xl border border-[#1a2744] bg-[#090c14]">
                    <div className="w-16 flex-shrink-0">
                      <p className="text-xs font-semibold text-[#e2e8f0]">{p.phase}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded mt-1 inline-block ${
                        p.status === 'objetivo' ? 'bg-yellow-500/20 text-yellow-400' :
                        p.status === 'meta' ? 'bg-[#0ea5e9]/20 text-[#0ea5e9]' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>{p.status}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-[#00d4ff] font-mono">{p.target}/mes</p>
                      <p className="text-xs text-[#64748b] mt-0.5">{p.how}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#475569]">{p.milestone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── KPIs ── */}
        {activeTab === 'kpis' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#00d4ff]">📊 KPIs Financieros</h2>
            <p className="text-sm text-[#94a3b8]">Las métricas que importan para un negocio de servicios SaaS en etapa de arranque.</p>

            {/* KPIs principales */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">KPIs Principales — Revisión Mensual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    kpi: 'MRR (Monthly Recurring Revenue)',
                    formula: 'Suma de retainers activos',
                    now: '$0',
                    target30: '$0',
                    target90: '$800+',
                    priority: 'CRÍTICO',
                    note: 'El objetivo máximo del año: convertir proyectos en retainers.',
                  },
                  {
                    kpi: 'Revenue Total Mensual',
                    formula: 'MRR + pagos de proyectos / 30 días',
                    now: '$0',
                    target30: '$1,500',
                    target90: '$3,500+',
                    priority: 'CRÍTICO',
                    note: 'El número que valida que el negocio funciona.',
                  },
                  {
                    kpi: 'Tasa de Cierre',
                    formula: 'Contratos firmados / Propuestas enviadas × 100',
                    now: 'N/A',
                    target30: 'datos',
                    target90: '> 30%',
                    priority: 'ALTO',
                    note: 'Si es < 20%, revisar pricing o calificación de leads.',
                  },
                  {
                    kpi: 'Tiempo Medio de Cierre',
                    formula: 'Días entre primer contacto y contrato firmado',
                    now: 'N/A',
                    target30: 'datos',
                    target90: '< 7 días',
                    priority: 'ALTO',
                    note: 'Más de 14 días = proceso roto o lead no calificado.',
                  },
                  {
                    kpi: 'Valor Promedio de Proyecto (APV)',
                    formula: 'Revenue total / número de proyectos',
                    now: 'N/A',
                    target30: '$1,500',
                    target90: '$3,000+',
                    priority: 'MEDIO',
                    note: 'Sube subiendo precios o con upsells (retainers post-proyecto).',
                  },
                  {
                    kpi: 'Margen Bruto',
                    formula: '(Revenue - Costos directos) / Revenue × 100',
                    now: 'N/A',
                    target30: '85%+',
                    target90: '85%+',
                    priority: 'MEDIO',
                    note: 'Servicios digitales deben mantener > 80%. Si baja, revisar scope creep.',
                  },
                ].map((k) => (
                  <div key={k.kpi} className="p-4 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold text-[#e2e8f0] leading-tight">{k.kpi}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded flex-shrink-0 ml-2 ${
                        k.priority === 'CRÍTICO' ? 'bg-red-500/20 text-red-400' :
                        k.priority === 'ALTO' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{k.priority}</span>
                    </div>
                    <p className="text-[10px] text-[#475569] font-mono mb-3">{k.formula}</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <p className="text-[9px] text-[#475569]">Hoy</p>
                        <p className="text-xs font-mono text-[#94a3b8]">{k.now}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-[#475569]">30 días</p>
                        <p className="text-xs font-mono text-yellow-400">{k.target30}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-[#475569]">90 días</p>
                        <p className="text-xs font-mono text-[#00d4ff]">{k.target90}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#475569] italic">{k.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Señales de alerta */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Señales de Alerta — Actúa de Inmediato</h3>
              <div className="space-y-2">
                {[
                  { signal: 'Tasa de cierre < 15%', action: 'Revisa el proceso de calificación. Estás hablando con los leads equivocados.' },
                  { signal: '0 propuestas enviadas en 2 semanas', action: 'Problema de generación de leads. Activa contenido o contacto directo hoy.' },
                  { signal: 'Un solo cliente = > 60% del revenue', action: 'Riesgo de concentración crítico. Diversificar en 30 días o antes.' },
                  { signal: 'Proyecto entregado tarde 2 veces seguidas', action: 'Problema de scope o tiempo. Revisar el proceso de intake y estimación.' },
                  { signal: 'Cliente solicita más del scope original', action: 'Scope creep. Cobrar por extras o perder margen. Definir el proceso ahora.' },
                ].map((s) => (
                  <div key={s.signal} className="flex gap-4 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                    <span className="text-red-400 text-sm flex-shrink-0">⚠</span>
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-0.5">{s.signal}</p>
                      <p className="text-xs text-[#64748b]">{s.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TRACKER ── */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#00d4ff]">📈 Tracker de Ingresos</h2>
            <p className="text-sm text-[#94a3b8]">
              Plantilla para registrar todos los ingresos desde el primer proyecto. Sin datos ahora — lista para cuando entren.
            </p>

            {/* Template de registro */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Registro de Transacciones — Template</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1a2744]">
                      {['Fecha', 'Cliente', 'Tipo', 'Concepto', 'Monto USD', 'Estado', 'Método Pago'].map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-[#475569] uppercase tracking-widest text-[9px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: '—', client: 'Cliente A', type: 'Proyecto', concept: 'MVP SaaS — 50% inicio', amount: '$1,250', status: 'pendiente', method: 'Stripe' },
                      { date: '—', client: 'Cliente A', type: 'Proyecto', concept: 'MVP SaaS — 50% entrega', amount: '$1,250', status: 'pendiente', method: 'Stripe' },
                      { date: '—', client: 'Cliente B', type: 'Retainer', concept: 'Mantenimiento mensual', amount: '$800', status: 'pendiente', method: 'Stripe' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[#1a2744]/50 hover:bg-[#0d1117]">
                        <td className="py-2.5 px-3 text-[#475569]">{row.date}</td>
                        <td className="py-2.5 px-3 text-[#94a3b8]">{row.client}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                            row.type === 'Retainer' ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'bg-[#0ea5e9]/20 text-[#0ea5e9]'
                          }`}>{row.type}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#64748b]">{row.concept}</td>
                        <td className="py-2.5 px-3 text-[#e2e8f0] font-mono font-semibold">{row.amount}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#334155] text-[#64748b]">{row.status}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#475569]">{row.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-[#334155] mt-2">Copia este tracker a Notion. Actualizar cada vez que entra un pago.</p>
            </div>

            {/* Resumen mensual template */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Resumen Mensual — Template de Cierre</h3>
              <div className="p-5 rounded-xl border border-[#1a2744] bg-[#0d1117] font-mono text-xs space-y-2">
                <p className="text-[#00d4ff]">## Cierre Financiero — [MES AÑO]</p>
                <p className="text-[#64748b]">─────────────────────────────────</p>
                <p className="text-[#94a3b8]">INGRESOS</p>
                <p className="text-[#64748b]">  Proyectos:     $_______ USD</p>
                <p className="text-[#64748b]">  Retainers:     $_______ USD</p>
                <p className="text-[#64748b]">  Otros:         $_______ USD</p>
                <p className="text-[#e2e8f0]">  TOTAL:         $_______ USD</p>
                <p className="text-[#64748b]">─────────────────────────────────</p>
                <p className="text-[#94a3b8]">GASTOS</p>
                <p className="text-[#64748b]">  Herramientas:  $_______ USD</p>
                <p className="text-[#64748b]">  Freelancers:   $_______ USD</p>
                <p className="text-[#64748b]">  Otros:         $_______ USD</p>
                <p className="text-[#e2e8f0]">  TOTAL:         $_______ USD</p>
                <p className="text-[#64748b]">─────────────────────────────────</p>
                <p className="text-[#00d4ff]">  UTILIDAD:      $_______ USD</p>
                <p className="text-[#00d4ff]">  MARGEN:        _______%</p>
                <p className="text-[#64748b]">─────────────────────────────────</p>
                <p className="text-[#94a3b8]">PIPELINE PRÓXIMO MES</p>
                <p className="text-[#64748b]">  Proyectos confirmados: $_______</p>
                <p className="text-[#64748b]">  Propuestas enviadas:   $_______</p>
                <p className="text-[#64748b]">  Leads calificados:     ___ leads</p>
              </div>
            </div>
          </div>
        )}

        {/* ── ESTRATEGIA 90 DÍAS ── */}
        {activeTab === 'estrategia' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#00d4ff]">🎯 Estrategia Financiera — 90 Días</h2>
            <p className="text-sm text-[#94a3b8]">Plan específico para pasar de $0 a negocio financieramente estable.</p>

            {/* Prioridades */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-3">Prioridades Financieras — En Orden</h3>
              <div className="space-y-3">
                {[
                  {
                    n: '01',
                    priority: 'Primer ingreso en < 30 días',
                    action: 'Un solo proyecto a cualquier precio dentro del rango ($1,500+). La experiencia y la prueba social valen más que el margen en este momento.',
                    impact: 'Valida el modelo. Da confianza para el siguiente.',
                    color: '#ef4444',
                  },
                  {
                    n: '02',
                    priority: 'Cobrar correctamente desde el día 1',
                    action: 'Stripe configurado. 50% antes de empezar. Contrato firmado. Sin excepciones. Cada cliente sin contrato es riesgo financiero puro.',
                    impact: 'Previene el problema más común del freelance: trabajar gratis.',
                    color: '#f59e0b',
                  },
                  {
                    n: '03',
                    priority: 'Convertir 1 proyecto en retainer',
                    action: 'Al entregar el primer proyecto, ofrecer mantenimiento mensual ($800-1,200 USD). El cliente ya confía en ti. El costo de adquisición ya fue pagado.',
                    impact: 'MRR = estabilidad financiera real. Cambia todo.',
                    color: '#0ea5e9',
                  },
                  {
                    n: '04',
                    priority: 'Separar finanzas negocio / personal',
                    action: 'Cuenta bancaria dedicada al negocio. Todo pago de cliente entra ahí. Transferencia a personal solo del "sueldo" mensual definido.',
                    impact: 'Visibilidad real de la salud del negocio. Necesario para escalar.',
                    color: '#22c55e',
                  },
                  {
                    n: '05',
                    priority: 'Construir reserva de 2 meses',
                    action: 'Del primer revenue, apartar 20% a reserva. No tocar. Meta: 2 meses de gastos personales en reserva antes del mes 6.',
                    impact: 'Elimina el miedo. Permite rechazar malos clientes. Da poder de negociación.',
                    color: '#a855f7',
                  },
                ].map((p) => (
                  <div key={p.n} className="p-5 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <div className="flex items-start gap-4">
                      <p className="text-3xl font-bold font-mono flex-shrink-0" style={{ color: p.color }}>{p.n}</p>
                      <div>
                        <p className="text-base font-semibold text-[#e2e8f0] mb-2">{p.priority}</p>
                        <p className="text-xs text-[#94a3b8] leading-relaxed mb-2">{p.action}</p>
                        <p className="text-[10px] text-[#00d4ff]">Impacto: {p.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regla del 20% */}
            <div className="p-5 rounded-xl border border-[#00d4ff]/20 bg-[#00d4ff]/5">
              <h3 className="text-xs uppercase tracking-widest text-[#475569] mb-4">Regla de Distribución de Ingresos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                {[
                  { pct: '50%', label: 'Gastos personales / sueldo' },
                  { pct: '20%', label: 'Reserva de emergencia' },
                  { pct: '20%', label: 'Reinversión en negocio' },
                  { pct: '10%', label: 'Impuestos / contabilidad' },
                ].map((d) => (
                  <div key={d.label} className="p-3 rounded-xl border border-[#1a2744] bg-[#0d1117]">
                    <p className="text-2xl font-bold text-[#00d4ff]">{d.pct}</p>
                    <p className="text-[10px] text-[#475569] mt-1 leading-tight">{d.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#334155] text-center mt-3">
                Aplicar desde el primer pago. La disciplina financiera en etapa temprana = supervivencia en etapa de escala.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#1a2744] text-center">
          <p className="text-[10px] text-[#334155] uppercase tracking-widest">
            Raziel CFO Virtual — Análisis para: Solo Founder · SaaS Dev Services · Pre-Revenue → Arranque 2026
          </p>
        </div>
      </div>
    </div>
  )
}
