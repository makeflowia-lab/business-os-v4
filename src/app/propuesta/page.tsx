'use client'

import Link from 'next/link'

export default function PropuestaPage() {
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
            <span className="text-xs text-[#64748b] tracking-widest uppercase">Raziel — Propuesta Tecnológica</span>
          </div>
          <h1 className="text-3xl font-bold text-white print:text-black mb-2">
            Propuesta Tecnológica
          </h1>
          <p className="text-[#64748b] print:text-gray-500 text-sm">
            Generada con metodología Raziel · {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] print:bg-gray-100 print:border-gray-300">
            <span className="text-[#00d4ff] print:text-gray-700 text-xs font-semibold tracking-wide">CLOUD — SaaS Multi-tenant · Vercel + Neon</span>
          </div>
        </div>

        {/* Cliente */}
        <div className="mb-8 p-5 rounded-2xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
          <p className="text-xs text-[#00d4ff] print:text-gray-500 uppercase tracking-widest mb-1">Cliente</p>
          <h2 className="text-2xl font-bold text-white print:text-black">Constructora Vega</h2>
          <p className="text-[#94a3b8] print:text-gray-600 text-sm mt-1">
            Construcción y servicios de remodelación · México
          </p>
        </div>

        {/* ETAPA 1 */}
        <Section title="ETAPA 1" subtitle="Cliente y Negocio" color="blue">
          <Table rows={[
            ['Industria', 'Construcción y servicios — proyectos residenciales y comerciales'],
            ['Empleados', '5 – 15 personas con operación activa'],
            ['Problema', 'Pierden leads por seguimiento manual en WhatsApp. Cotizaciones en Word tardan 2-3 días — cuando llegan, el cliente ya eligió a otro.'],
            ['Objetivo', 'Automatizar captación de leads, generación de cotizaciones profesionales y seguimiento hasta cierre de contrato'],
            ['Presupuesto', '$0 fase MVP · $1,500 USD SaaS completo'],
            ['Entrega', 'MVP funcional en 15 días · SaaS completo en 30 días desde aprobación'],
          ]} />
        </Section>

        {/* ETAPA 2 */}
        <Section title="ETAPA 2" subtitle="Arquitectura Técnica" color="soul">
          <div className="space-y-3">

            {/* Stack */}
            <div className="p-4 rounded-xl bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.2)] print:bg-blue-50 print:border-blue-200">
              <p className="text-[#00d4ff] print:text-blue-700 text-xs font-semibold uppercase tracking-widest mb-3">Stack Tecnológico</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { layer: 'Frontend', tech: 'Next.js 16 + React 19 + TypeScript' },
                  { layer: 'Estilos', tech: 'Tailwind CSS 3.4' },
                  { layer: 'Base de datos', tech: 'Neon — PostgreSQL serverless' },
                  { layer: 'Autenticación', tech: 'NextAuth.js' },
                  { layer: 'Deploy', tech: 'Vercel — CI/CD automático' },
                  { layer: 'PDF Export', tech: 'Print nativo del browser' },
                ].map((item) => (
                  <div key={item.layer} className="p-2.5 rounded-lg bg-[#0d1117] border border-[#1a2744] print:bg-white print:border-gray-200">
                    <p className="text-[#475569] print:text-gray-400 text-[10px] uppercase tracking-wider">{item.layer}</p>
                    <p className="text-[#e2e8f0] print:text-black text-xs font-medium mt-0.5">{item.tech}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Módulos */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
              <p className="text-[#64748b] print:text-gray-500 text-xs uppercase tracking-widest mb-3 font-semibold">Módulos del Sistema</p>
              <div className="space-y-2.5">
                {[
                  { icon: '📥', name: 'CRM de Leads', desc: 'Captura, estados (nuevo / seguimiento / cotizado / cerrado / perdido), historial de contacto' },
                  { icon: '📄', name: 'Generador de Cotizaciones', desc: 'Plantilla profesional con materiales, tiempo y precio. Exportable a PDF en un clic' },
                  { icon: '📋', name: 'Panel de Proyectos', desc: 'Seguimiento por etapa, fechas, responsable y documentos adjuntos' },
                  { icon: '📊', name: 'Dashboard de Métricas', desc: 'Leads del mes, tasa de cierre, cotizaciones enviadas, ingresos proyectados' },
                ].map((mod) => (
                  <div key={mod.name} className="flex gap-3 p-3 rounded-lg bg-[#060810] border border-[#1a2744] print:bg-white print:border-gray-100">
                    <span className="text-lg flex-shrink-0">{mod.icon}</span>
                    <div>
                      <p className="text-[#e2e8f0] print:text-black text-sm font-medium">{mod.name}</p>
                      <p className="text-[#64748b] print:text-gray-500 text-xs mt-0.5">{mod.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Integraciones */}
            <div className="p-4 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
              <p className="text-[#64748b] print:text-gray-500 text-xs uppercase tracking-widest mb-2 font-semibold">Integraciones</p>
              <div className="flex flex-wrap gap-2">
                {['Email — notificaciones de nuevo lead', 'PDF nativo — sin dependencias externas'].map((item) => (
                  <span key={item} className="text-xs px-3 py-1 rounded-full bg-[#060810] border border-[#1a2744] text-[#94a3b8] print:border-gray-200 print:text-gray-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ETAPA 3 */}
        <Section title="ETAPA 3" subtitle="Infraestructura y Costos" color="green">
          <div className="space-y-3">

            {/* Costos */}
            <div className="overflow-hidden rounded-xl border border-[#1a2744] print:border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0d1117] print:bg-gray-100 border-b border-[#1a2744] print:border-gray-200">
                    <th className="text-left px-4 py-2.5 text-[#64748b] print:text-gray-500 text-xs uppercase tracking-wider font-semibold">Servicio</th>
                    <th className="text-left px-4 py-2.5 text-[#64748b] print:text-gray-500 text-xs uppercase tracking-wider font-semibold">Plan</th>
                    <th className="text-right px-4 py-2.5 text-[#64748b] print:text-gray-500 text-xs uppercase tracking-wider font-semibold">Costo/mes</th>
                  </tr>
                </thead>
                <tbody className="bg-[#060810] print:bg-white">
                  {[
                    { service: 'Vercel', plan: 'Hobby (MVP) → Pro al escalar', cost: '$0 → $20 USD' },
                    { service: 'Neon', plan: 'Free tier cubre el MVP completo', cost: '$0 → $19 USD' },
                    { service: 'Dominio', plan: 'Registro anual', cost: '~$1.25 USD' },
                  ].map((row) => (
                    <tr key={row.service} className="border-b border-[#1a2744] print:border-gray-100 last:border-0">
                      <td className="px-4 py-3 text-[#e2e8f0] print:text-black font-medium">{row.service}</td>
                      <td className="px-4 py-3 text-[#94a3b8] print:text-gray-600 text-xs">{row.plan}</td>
                      <td className="px-4 py-3 text-right text-[#e2e8f0] print:text-black font-medium">{row.cost}</td>
                    </tr>
                  ))}
                  <tr className="bg-[rgba(0,212,255,0.06)] print:bg-blue-50">
                    <td className="px-4 py-3 text-[#00d4ff] print:text-blue-700 font-bold text-sm">Total MVP</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right text-[#00d4ff] print:text-blue-700 font-bold">$0 / mes</td>
                  </tr>
                  <tr className="bg-[rgba(0,212,255,0.04)] print:bg-blue-50">
                    <td className="px-4 py-3 text-[#00d4ff] print:text-blue-700 font-bold text-sm">Total Producción</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right text-[#00d4ff] print:text-blue-700 font-bold">~$40 USD / mes</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SLA y Escalabilidad */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Uptime garantizado', value: '99.99% — Vercel + Neon redundancia automática' },
                { label: 'Mantenimiento', value: 'Incluido en el engagement. Nuevos módulos con costo adicional' },
                { label: 'Escalabilidad', value: 'De 1 a cientos de usuarios sin cambiar arquitectura — solo subir plan' },
                { label: 'Seguridad', value: 'SSL incluido · Backups automáticos · Variables de entorno cifradas' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                  <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-[#e2e8f0] print:text-black text-xs leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Inversión */}
        <Section title="INVERSIÓN" subtitle="Resumen de la propuesta" color="amber">
          <div className="space-y-3">
            {[
              { fase: 'FASE 1 — MVP', precio: '$0 USD', tiempo: '15 días o menos', desc: 'Sistema funcional para evaluación real. Sin compromiso de pago.' },
              { fase: 'FASE 2 — SaaS Completo', precio: '$1,500 USD', tiempo: '30 días desde aprobación', desc: 'Sistema completo, documentado, desplegado en producción con soporte incluido.' },
            ].map((fase) => (
              <div key={fase.fase} className="p-4 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[#00d4ff] print:text-blue-600 text-xs font-bold tracking-widest">{fase.fase}</p>
                    <p className="text-[#475569] print:text-gray-400 text-xs mt-0.5">{fase.tiempo}</p>
                  </div>
                  <p className="text-white print:text-black text-lg font-bold">{fase.precio}</p>
                </div>
                <p className="text-[#94a3b8] print:text-gray-600 text-sm">{fase.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Firma */}
        <div className="mt-10 pt-6 border-t border-[#1a2744] print:border-gray-300">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[#475569] print:text-gray-400 text-xs mb-1">Preparado por</p>
              <p className="text-[#e2e8f0] print:text-black text-sm font-semibold">Consultoría con IA — Modelo B</p>
              <p className="text-[#475569] print:text-gray-400 text-xs mt-0.5">Generado por Raziel · Soul Reaver</p>
            </div>
            <div className="text-right">
              <p className="text-[#475569] print:text-gray-400 text-xs">Válida por 15 días calendario</p>
              <p className="text-[#475569] print:text-gray-400 text-xs mt-0.5">{new Date().getFullYear()}</p>
            </div>
          </div>
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
  color: 'blue' | 'amber' | 'green' | 'soul'
  children: React.ReactNode
}) {
  const colors = {
    blue:  { dot: 'bg-[#0ea5e9]',  border: 'border-[#0ea5e9]/30',  text: 'text-[#0ea5e9]' },
    amber: { dot: 'bg-amber-400',   border: 'border-amber-400/30',   text: 'text-amber-400' },
    green: { dot: 'bg-emerald-400', border: 'border-emerald-400/30', text: 'text-emerald-400' },
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
          <span className="text-[#64748b] print:text-gray-500 text-sm w-36 flex-shrink-0">{label}</span>
          <span className="text-[#e2e8f0] print:text-black text-sm">{value}</span>
        </div>
      ))}
    </div>
  )
}
