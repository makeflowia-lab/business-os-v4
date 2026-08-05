'use client'

import Link from 'next/link'

export default function OfertaPage() {
  const handlePrint = () => window.print()

  return (
    <div className="h-screen overflow-y-auto doc-scroll bg-[#060810] text-[#e2e8f0] print:bg-white print:text-black">

      {/* Toolbar */}
      <div className="no-print flex items-center justify-between px-6 py-3 border-b border-[#1a2744] bg-[#0d1117]/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#e2e8f0] transition-colors">
          ← Volver a Raziel
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium transition-colors"
        >
          ⬇ Exportar PDF
        </button>
      </div>

      {/* Documento */}
      <div className="max-w-3xl mx-auto px-6 py-10 print:py-6 print:px-8">

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#1a2744] print:border-gray-300">
          <div className="flex items-center gap-3 mb-4 print:hidden">
            <div className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
            <span className="text-xs text-[#64748b] tracking-widest uppercase">Raziel — Asesor Comercial</span>
          </div>
          <h1 className="text-3xl font-bold text-white print:text-black mb-2">
            Oferta Irresistible
          </h1>
          <p className="text-[#64748b] print:text-gray-500 text-sm">
            Construida con Ecuación de Valor de Alex Hormozi · {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] print:bg-gray-100 print:border-gray-300">
            <span className="text-[#00d4ff] print:text-gray-700 text-xs font-semibold tracking-wide">MODELO B — Consultoría con IA · SaaS a la Medida</span>
          </div>
        </div>

        {/* Promesa Central */}
        <div className="mb-8 p-6 rounded-2xl bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.25)] print:bg-blue-50 print:border-blue-200">
          <p className="text-xs text-[#00d4ff] print:text-blue-600 uppercase tracking-widest mb-3 font-semibold">La Promesa</p>
          <h2 className="text-xl font-bold text-white print:text-black leading-snug">
            "Te entrego un MVP funcional de tu solución SaaS en 15 días o menos — completamente gratis. Si decides continuar, en un mes tienes tu sistema completo."
          </h2>
        </div>

        {/* Ecuación de Valor */}
        <Section title="ECUACIÓN" subtitle="Valor según Hormozi" color="soul">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Resultado soñado', value: 'SaaS funcional que elimina procesos manuales y recupera leads perdidos', positive: true },
              { label: 'Probabilidad percibida', value: 'MVP gratis en 15 días — el cliente lo ve funcionar antes de comprometerse', positive: true },
              { label: 'Demora', value: '15 días MVP · 30 días SaaS completo — sin esperas de meses', positive: true },
              { label: 'Esfuerzo del cliente', value: 'Cero riesgo financiero · Solo da contexto de su negocio y evalúa', positive: true },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-[#e2e8f0] print:text-black text-xs leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Stack de Valor */}
        <Section title="STACK" subtitle="Qué incluye la oferta" color="blue">
          <div className="space-y-2">
            {[
              { fase: 'FASE 1 — GRATIS', tiempo: '15 días o menos', items: ['MVP funcional de tu solución SaaS', 'Diseño y arquitectura del sistema', 'Proceso manual identificado y automatizado', 'Entrega para evaluación real'] },
              { fase: 'FASE 2 — CON INVERSIÓN', tiempo: '30 días desde luz verde', items: ['SaaS completo production-ready', 'Propuesta tecnológica documentada', 'Documentación legal incluida', 'Soporte y actualizaciones del sistema'] },
            ].map((fase) => (
              <div key={fase.fase} className="p-4 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#00d4ff] print:text-blue-600 text-xs font-bold tracking-widest">{fase.fase}</span>
                  <span className="text-[#475569] print:text-gray-400 text-xs">{fase.tiempo}</span>
                </div>
                <ul className="space-y-1.5">
                  {fase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#cbd5e1] print:text-gray-700">
                      <span className="text-[#00d4ff] print:text-blue-500 mt-0.5 flex-shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Garantía */}
        <Section title="GARANTÍA" subtitle="Inversión de riesgo total" color="green">
          <div className="p-4 rounded-xl bg-[rgba(52,211,153,0.06)] border border-[rgba(52,211,153,0.2)] print:bg-green-50 print:border-green-200">
            <p className="text-emerald-400 print:text-green-700 text-sm font-semibold mb-2">Riesgo cero para el cliente</p>
            <p className="text-[#cbd5e1] print:text-gray-700 text-sm leading-relaxed">
              El MVP es completamente gratuito. El cliente evalúa el producto funcionando en su contexto real antes de tomar cualquier decisión de inversión. Si no le convence, no paga nada. Si le convence, decide continuar al SaaS completo.
            </p>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
            <p className="text-[#64748b] print:text-gray-500 text-xs uppercase tracking-wider mb-1">Por qué puedes ofrecer esto</p>
            <p className="text-[#94a3b8] print:text-gray-600 text-sm">Construyes MVPs en horas, no en semanas. El costo real de producción es mínimo. La confianza en el producto hace el resto.</p>
          </div>
        </Section>

        {/* Diferenciador */}
        <Section title="DIFERENCIADOR" subtitle="Por qué tú y no la competencia" color="amber">
          <Item
            label="El mercado hoy"
            value="La IA democratizó el desarrollo — cualquiera puede hacer un MVP. Pero saber usar una herramienta no es lo mismo que tener un sistema."
          />
          <Item
            label="Lo que otros entregan"
            value="Código. A veces funciona, a veces no. Sin estrategia, sin documentación, sin estructura de negocio."
            highlight
          />
          <Item
            label="Lo que tú entregas"
            value="Sistema completo: estrategia comercial + arquitectura + SaaS funcional + documentación legal + soporte. De la idea al producto en un flujo integrado."
            highlight
          />
        </Section>

        {/* Avatar */}
        <Section title="CLIENTE IDEAL" subtitle="A quién va dirigida esta oferta" color="red">
          <Table rows={[
            ['Perfil', 'Empresario 32–50 años, negocio funcionando, México / LATAM'],
            ['Ingreso actual', '$2,000 – $8,000 USD/mes'],
            ['Dolor específico', 'Procesos manuales que le cuestan leads, tiempo y dinero'],
            ['Lo que ha intentado', 'Redes sociales, Excel, propuestas improvisadas — nada funcionó'],
            ['Por qué dice sí', 'El MVP es gratis — no tiene nada que perder'],
          ]} />
        </Section>

        {/* Objeción principal */}
        <Section title="OBJECIÓN" subtitle="Cómo responder al No tengo presupuesto" color="soul">
          <div className="p-4 rounded-xl bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.2)] print:bg-blue-50 print:border-blue-200">
            <p className="text-[#64748b] print:text-gray-500 text-xs uppercase tracking-wider mb-2">Cuando digan: "No tengo presupuesto"</p>
            <p className="text-white print:text-black text-sm font-medium italic leading-relaxed">
              "Perfecto — el MVP no tiene costo. Dime cuánto te está costando hoy ese proceso manual en tiempo, leads perdidos y errores humanos. Eso es lo que vamos a eliminar primero."
            </p>
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-[#1a2744] print:border-gray-300 flex items-center justify-between">
          <p className="text-[#475569] print:text-gray-400 text-xs">
            Generado por Raziel — Soul Reaver · Metodología Alex Hormozi
          </p>
          <p className="text-[#475569] print:text-gray-400 text-xs">
            {new Date().getFullYear()}
          </p>
        </div>

      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}

/* ── Componentes internos ── */

function Section({ title, subtitle, color, children }: {
  title: string
  subtitle: string
  color: 'blue' | 'amber' | 'green' | 'red' | 'soul'
  children: React.ReactNode
}) {
  const colors = {
    blue:  { dot: 'bg-[#0ea5e9]',  border: 'border-[#0ea5e9]/30',  text: 'text-[#0ea5e9]' },
    amber: { dot: 'bg-amber-400',   border: 'border-amber-400/30',   text: 'text-amber-400' },
    green: { dot: 'bg-emerald-400', border: 'border-emerald-400/30', text: 'text-emerald-400' },
    red:   { dot: 'bg-red-400',     border: 'border-red-400/30',     text: 'text-red-400' },
    soul:  { dot: 'bg-[#00d4ff]',   border: 'border-[#00d4ff]/30',  text: 'text-[#00d4ff]' },
  }
  const c = colors[color]

  return (
    <div className={`mb-8 p-5 rounded-2xl bg-[#0d1117] border ${c.border} print:bg-white print:border-gray-200`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${c.dot} print:hidden`} />
        <span className={`text-[10px] ${c.text} print:text-gray-500 uppercase tracking-widest font-semibold`}>{title}</span>
        <span className="text-white print:text-black text-sm font-semibold">— {subtitle}</span>
      </div>
      {children}
    </div>
  )
}

function Table({ rows }: { rows: [string, string][] }) {
  return (
    <div className="space-y-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-3 py-2 border-b border-[#1a2744] print:border-gray-100 last:border-0">
          <span className="text-[#64748b] print:text-gray-500 text-sm w-40 flex-shrink-0">{label}</span>
          <span className="text-[#e2e8f0] print:text-black text-sm">{value}</span>
        </div>
      ))}
    </div>
  )
}

function Item({ label, value, highlight }: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-[#64748b] print:text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm leading-relaxed ${highlight ? 'text-white print:text-black font-medium' : 'text-[#cbd5e1] print:text-gray-700'}`}>
        {value}
      </p>
    </div>
  )
}
