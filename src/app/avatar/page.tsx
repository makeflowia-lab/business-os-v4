'use client'

import Link from 'next/link'

export default function AvatarPage() {
  const handlePrint = () => window.print()

  return (
    <div className="h-screen overflow-y-auto doc-scroll bg-[#060810] text-[#e2e8f0] print:bg-white print:text-black">

      {/* Toolbar — oculto al imprimir */}
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

        {/* Header del documento */}
        <div className="mb-10 pb-6 border-b border-[#1a2744] print:border-gray-300">
          <div className="flex items-center gap-3 mb-4 print:hidden">
            <div className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
            <span className="text-xs text-[#64748b] tracking-widest uppercase">Raziel — Asesor Comercial</span>
          </div>
          <h1 className="text-3xl font-bold text-white print:text-black mb-2">
            Avatar del Cliente Ideal
          </h1>
          <p className="text-[#64748b] print:text-gray-500 text-sm">
            Documento generado con metodología Hormozi · {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] print:bg-gray-100 print:border-gray-300">
            <span className="text-[#00d4ff] print:text-gray-700 text-xs font-semibold tracking-wide">MODELO B — Consultoría con IA</span>
          </div>
        </div>

        {/* Nombre del Avatar */}
        <div className="mb-8 p-5 rounded-2xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
          <p className="text-xs text-[#00d4ff] print:text-gray-500 uppercase tracking-widest mb-1">Nombre del Avatar</p>
          <h2 className="text-2xl font-bold text-white print:text-black">El Empresario Invisible</h2>
          <p className="text-[#94a3b8] print:text-gray-600 text-sm mt-1">
            Tiene un negocio que funciona. Pero nadie lo sabe — porque no sabe vender.
          </p>
        </div>

        {/* BLOQUE 1 */}
        <Section title="BLOQUE 1" subtitle="Demografía Básica" color="blue">
          <Table rows={[
            ['¿Quién es?', 'Dueño de negocio con empresa funcionando'],
            ['Edad', '32 – 50 años'],
            ['Ubicación', 'México / LATAM — ciudad media o grande'],
            ['Ingresos actuales', '$2,000 – $8,000 USD/mes — factura pero sin sistema'],
            ['Industria', 'Servicios, comercio, consultoría, construcción'],
            ['Tecnología', 'No es técnico — usa WhatsApp, Excel y poco más'],
          ]} />
        </Section>

        {/* BLOQUE 2 */}
        <Section title="BLOQUE 2" subtitle="Psicografía y Comportamiento" color="amber">
          <Item
            label="Su miedo más profundo"
            value='"Tengo clientes, pero no sé cómo conseguir más — y los que tengo los conseguí por recomendación, no por estrategia."'
            highlight
          />
          <Item
            label="Su resultado soñado"
            value="Verse profesional, cerrar contratos más grandes, no depender del boca a boca."
          />
          <Item
            label="Lo que ha intentado sin éxito"
            value="Contrató a alguien para redes sociales (no funcionó). Hizo propuestas en Word improvisadas (las perdió). Intentó llevar finanzas en Excel (lo abandonó)."
          />
          <Item
            label="Por qué no lo ha resuelto"
            value="No sabe de tecnología. No tiene tiempo ni equipo. Cree que necesita dinero cuando en realidad necesita sistema."
          />
          <Item
            label="Cree que necesita vs. lo que realmente necesita"
            value="Cree: más seguidores, más publicidad. Necesita: sistema de ventas, documentación profesional, estrategia clara."
          />
        </Section>

        {/* BLOQUE 3 */}
        <Section title="BLOQUE 3" subtitle="Lenguaje y Objeciones" color="green">
          <Item
            label="Lo que dice textualmente"
            value={[
              '"Necesito organizarme mejor."',
              '"No sé cómo cobrar lo que valgo."',
              '"Pierdo clientes porque no me veo profesional."',
            ].join('\n')}
            multiline
          />
          <Item
            label="Objeción #1 para NO comprar"
            value='"Eso es muy técnico para mí."'
            highlight
          />
          <Item
            label="Lo que lo haría decir SÍ"
            value='"Tú me entregas todo listo — yo solo apruebo."'
            highlight
          />
        </Section>

        {/* BLOQUE 4 */}
        <Section title="BLOQUE 4" subtitle="Anti-Avatar — A quién NO servir" color="red">
          <div className="space-y-2">
            {[
              ['El que quiere aprender herramientas', 'Tú usas Raziel internamente — no enseñas, entregas resultados.'],
              ['El que regatéa desde el primer mensaje', 'Si empieza así, así termina. Problema de valores, no de precio.'],
              ['El que no tiene negocio todavía', 'Sin operación real no hay qué organizar ni vender.'],
              ['El que quiere resultados sin dar información', 'Raziel necesita contexto real. Sin datos, sin estrategia.'],
            ].map(([tipo, razon]) => (
              <div key={tipo} className="flex gap-3 p-3 rounded-xl bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] print:bg-red-50 print:border-red-200">
                <span className="text-red-400 print:text-red-600 mt-0.5 flex-shrink-0">✕</span>
                <div>
                  <p className="text-[#e2e8f0] print:text-black text-sm font-medium">{tipo}</p>
                  <p className="text-[#94a3b8] print:text-gray-600 text-xs mt-0.5">{razon}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Modelo de Negocio */}
        <Section title="MODELO" subtitle="Cómo funciona tu negocio con Raziel" color="soul">
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.2)] print:bg-blue-50 print:border-blue-200">
              <p className="text-[#00d4ff] print:text-blue-700 text-xs font-semibold uppercase tracking-widest mb-2">Modelo B — Consultoría con IA</p>
              <div className="space-y-1.5 text-sm text-[#cbd5e1] print:text-gray-700">
                <p>1. El cliente te contrata a <strong className="text-white print:text-black">ti</strong></p>
                <p>2. Tú usas Raziel con sus 7 cerebros internamente</p>
                <p>3. Entregas propuestas, docs legales, estrategia, análisis financiero</p>
                <p>4. El cliente nunca ve la herramienta — ve los <strong className="text-white print:text-black">resultados</strong></p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Ingreso objetivo', value: '$3,000+ USD/mes' },
                { label: 'Tipo de ingreso', value: 'Por proyecto (Modelo B)' },
                { label: 'Clientes necesarios', value: '3-5 activos simultáneos' },
                { label: 'Ticket promedio', value: '$500 – $1,500 USD' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                  <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-wider">{item.label}</p>
                  <p className="text-white print:text-black text-sm font-semibold mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
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

      {/* Print styles */}
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
    soul:  { dot: 'bg-[#00d4ff]',  border: 'border-[#00d4ff]/30',  text: 'text-[#00d4ff]' },
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

function Item({ label, value, highlight, multiline }: {
  label: string
  value: string
  highlight?: boolean
  multiline?: boolean
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-[#64748b] print:text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm leading-relaxed whitespace-pre-line
        ${highlight
          ? 'text-white print:text-black font-medium italic'
          : 'text-[#cbd5e1] print:text-gray-700'
        }`}>
        {value}
      </p>
    </div>
  )
}
