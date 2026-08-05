'use client'

import Link from 'next/link'

export default function BrandingPage() {
  const handlePrint = () => window.print()

  return (
    <div className="h-screen overflow-y-auto doc-scroll bg-[#060810] text-[#e2e8f0] print:bg-white print:text-black">

      {/* Toolbar */}
      <div className="no-print flex items-center justify-between px-6 py-3 border-b border-[#1a2744] bg-[#0d1117]/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#e2e8f0] transition-colors">
          ← Volver a Raziel
        </Link>
        <button type="button" onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium transition-colors">
          ⬇ Exportar PDF
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 print:py-6 print:px-8">

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#1a2744] print:border-gray-300">
          <div className="flex items-center gap-3 mb-4 print:hidden">
            <div className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
            <span className="text-xs text-[#64748b] tracking-widest uppercase">Raziel — Identidad de Marca</span>
          </div>
          <h1 className="text-3xl font-bold text-white print:text-black mb-2">Brand Identity</h1>
          <p className="text-[#64748b] print:text-gray-500 text-sm">
            Consultoría Comercial con IA · {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] print:bg-gray-100 print:border-gray-300">
            <span className="text-[#00d4ff] print:text-gray-700 text-xs font-semibold tracking-wide">AUTORIDAD DISRUPTIVA · LATAM · B2B</span>
          </div>
        </div>

        {/* Esencia */}
        <Section title="ESENCIA" subtitle="El núcleo de la marca" color="soul">
          <div className="p-5 rounded-xl bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.2)] print:bg-blue-50 print:border-blue-200 mb-4">
            <p className="text-xs text-[#00d4ff] print:text-blue-600 uppercase tracking-widest font-semibold mb-2">Propósito</p>
            <p className="text-white print:text-black text-base font-semibold leading-relaxed">
              Entregar al empresario latinoamericano el sistema completo que transforma su operación — en días, no en meses.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Misión', value: 'Eliminar el caos operacional del empresario con sistemas inteligentes, entregados con velocidad y precisión quirúrgica.' },
              { label: 'Visión', value: 'Ser el referente en LATAM de consultoría tecnológica con IA — reconocido por resultados reales, no por promesas.' },
              { label: 'Valores', value: 'Precisión sobre volumen. Velocidad sin sacrificar calidad. Riesgo cero para el cliente. Verdad aunque duela.' },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-[#cbd5e1] print:text-gray-700 text-xs leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Posicionamiento */}
        <Section title="POSICIONAMIENTO" subtitle="Cómo ocupar un lugar en la mente del cliente" color="blue">
          <div className="space-y-3">
            <Item
              label="Declaración de posicionamiento"
              value="Para el empresario latinoamericano con operación funcionando pero sin sistema — que pierde leads, tiempo y dinero en procesos manuales — soy el consultor que entrega la solución completa en 15 días, gratis, sin riesgo. No soy una agencia. No soy un freelancer. Soy un sistema."
              highlight
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-wider mb-2">Percepción objetivo</p>
                <p className="text-[#e2e8f0] print:text-black text-xs leading-relaxed">Autoridad disruptiva — alguien que hace en horas lo que otros tardan meses. Que tiene herramientas que la competencia no tiene.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-wider mb-2">Emoción que provoca</p>
                <p className="text-[#e2e8f0] print:text-black text-xs leading-relaxed">Confianza + exclusividad. "Este consultor no es como los demás. Quiero que trabaje conmigo."</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Identidad verbal */}
        <Section title="VERBAL" subtitle="Cómo habla la marca" color="amber">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-emerald-400 print:text-green-600 text-[10px] uppercase tracking-wider font-semibold mb-2">✓ SÍ usamos</p>
                <div className="space-y-1.5">
                  {[
                    'Directo y sin rodeos',
                    'Técnico traducido a negocio',
                    'Números y métricas concretas',
                    'Frases cortas con peso',
                    'Verdad aunque incomode',
                    'Urgencia basada en costo real',
                  ].map((v) => (
                    <div key={v} className="flex gap-2 text-xs text-[#94a3b8] print:text-gray-600">
                      <span className="text-emerald-400 print:text-green-500 flex-shrink-0">→</span> {v}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-red-400 print:text-red-600 text-[10px] uppercase tracking-wider font-semibold mb-2">✗ NUNCA usamos</p>
                <div className="space-y-1.5">
                  {[
                    '"Sinergia"',
                    '"Solución 360"',
                    '"Innovación disruptiva"',
                    '"Ecosistema"',
                    '"Empoderamiento"',
                    'Fluff de agencia de marketing',
                  ].map((v) => (
                    <div key={v} className="flex gap-2 text-xs text-[#94a3b8] print:text-gray-600">
                      <span className="text-red-400 print:text-red-500 flex-shrink-0">✕</span> {v}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(245,158,11,0.06)] border border-amber-500/20 print:bg-yellow-50 print:border-yellow-200">
              <p className="text-amber-400 print:text-yellow-700 text-xs font-semibold uppercase tracking-wider mb-2">Arquetipo de personalidad</p>
              <p className="text-[#e2e8f0] print:text-black text-sm font-semibold mb-1">El Sabio + El Creador</p>
              <p className="text-[#94a3b8] print:text-gray-600 text-xs leading-relaxed">Habla desde la experiencia, no desde la teoría. Construye mientras explica. No pide permiso, declara. Serio pero accesible — como alguien que sabe exactamente lo que hace y no necesita convencerte con palabras vacías.</p>
            </div>
          </div>

          {/* Frases de marca */}
          <div className="mt-4 space-y-2">
            <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Frases de marca — cómo habla</p>
            {[
              { situacion: 'Presentación', frase: '"En 15 días tienes un MVP funcionando. Gratis. Si no te convence, no me debes nada."' },
              { situacion: 'Ante objeción de precio', frase: '"¿Cuánto te cuesta ese proceso manual al mes? Eso es lo que vamos a eliminar primero."' },
              { situacion: 'Diferenciador', frase: '"No soy una agencia que cobra y desaparece. Entrego el sistema completo — y el primero es gratis."' },
              { situacion: 'Cierre', frase: '"No tienes nada que perder. El riesgo es mío."' },
            ].map((f) => (
              <div key={f.situacion} className="flex gap-3 p-3 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                <span className="text-[#475569] print:text-gray-400 text-[10px] uppercase tracking-wider w-28 flex-shrink-0 mt-0.5">{f.situacion}</span>
                <p className="text-[#e2e8f0] print:text-black text-sm italic">{f.frase}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Identidad visual */}
        <Section title="VISUAL" subtitle="Cómo se ve la marca" color="green">
          <div className="space-y-4">

            {/* Paleta */}
            <div>
              <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-3">Paleta de color</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { nombre: 'Azul Raziel', hex: '#00d4ff', uso: 'Color primario — acción, energía, tecnología', dark: false },
                  { nombre: 'Azul profundo', hex: '#0ea5e9', uso: 'Secundario — botones, highlights, CTAs', dark: false },
                  { nombre: 'Fondo oscuro', hex: '#060810', uso: 'Background principal — profundidad y autoridad', dark: true },
                  { nombre: 'Superficie', hex: '#0d1117', uso: 'Cards y paneles — contraste suave sobre fondo', dark: true },
                  { nombre: 'Texto principal', hex: '#e2e8f0', uso: 'Texto destacado sobre fondos oscuros', dark: true },
                  { nombre: 'Texto secundario', hex: '#64748b', uso: 'Labels, subtítulos, metadata', dark: true },
                ].map((color) => (
                  <div key={color.nombre} className="flex gap-3 p-3 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200 items-center">
                    <div
                      className="w-10 h-10 rounded-lg flex-shrink-0 border border-[#1a2744] print:border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <p className="text-[#e2e8f0] print:text-black text-xs font-semibold">{color.nombre}</p>
                      <p className="text-[#475569] print:text-gray-400 text-[10px] font-mono">{color.hex}</p>
                      <p className="text-[#64748b] print:text-gray-500 text-[10px] mt-0.5">{color.uso}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipografía */}
            <div>
              <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-wider font-semibold mb-3">Tipografía</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { rol: 'Títulos', fuente: 'Inter — Bold 700', uso: 'Headers, nombres, CTA principales' },
                  { rol: 'Cuerpo', fuente: 'Inter — Regular 400', uso: 'Texto de lectura, descripciones' },
                  { rol: 'Labels', fuente: 'Inter — Semibold 600', uso: 'Uppercase tracking-widest, etiquetas' },
                  { rol: 'Código / Datos', fuente: 'JetBrains Mono', uso: 'Valores técnicos, métricas, HEX' },
                ].map((t) => (
                  <div key={t.rol} className="p-3 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                    <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-wider">{t.rol}</p>
                    <p className="text-[#e2e8f0] print:text-black text-sm font-semibold mt-0.5">{t.fuente}</p>
                    <p className="text-[#475569] print:text-gray-400 text-[10px] mt-0.5">{t.uso}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Estilo visual */}
            <div className="p-4 rounded-xl bg-[rgba(52,211,153,0.06)] border border-emerald-500/20 print:bg-green-50 print:border-green-200">
              <p className="text-emerald-400 print:text-green-700 text-xs font-semibold uppercase tracking-wider mb-3">Principios de diseño</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { principio: 'Dark first', desc: 'Fondos oscuros — proyectan autoridad, tecnología y exclusividad' },
                  { principio: 'Espaciado generoso', desc: 'El espacio en blanco es intencional — no llenamos por llenar' },
                  { principio: 'Bordes sutiles', desc: 'Bordes finos, no sombras gruesas — precisión sobre dramatismo' },
                  { principio: 'Acento azul', desc: 'Un solo color de acento — consistencia que construye reconocimiento' },
                ].map((p) => (
                  <div key={p.principio} className="p-2.5 rounded-lg bg-[#0d1117] border border-[#1a2744] print:bg-white print:border-gray-200">
                    <p className="text-[#e2e8f0] print:text-black text-xs font-semibold">{p.principio}</p>
                    <p className="text-[#64748b] print:text-gray-500 text-[10px] mt-0.5">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Diferenciación */}
        <Section title="DIFERENCIACIÓN" subtitle="Por qué tú y no la competencia" color="red">
          <div className="overflow-hidden rounded-xl border border-[#1a2744] print:border-gray-200 mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#0d1117] print:bg-gray-100 border-b border-[#1a2744] print:border-gray-200">
                  <th className="text-left px-4 py-2.5 text-[#64748b] print:text-gray-500 uppercase tracking-wider font-semibold">Dimensión</th>
                  <th className="text-left px-4 py-2.5 text-[#64748b] print:text-gray-500 uppercase tracking-wider font-semibold">Competencia</th>
                  <th className="text-left px-4 py-2.5 text-[#00d4ff] print:text-blue-600 uppercase tracking-wider font-semibold">Tú</th>
                </tr>
              </thead>
              <tbody className="bg-[#060810] print:bg-white">
                {[
                  ['Entregable', 'Código o diseño por separado', 'Sistema completo: estrategia + producto + docs'],
                  ['Tiempo', 'Semanas o meses', 'MVP en 15 días, SaaS en 30 días'],
                  ['Riesgo cliente', 'Pago por adelantado', 'MVP gratis — paga solo si convence'],
                  ['Herramientas', 'Stack estándar', 'Raziel como sistema interno — ventaja invisible'],
                  ['Soporte', 'Adicional o incluido parcial', 'Incluido en el engagement'],
                  ['Precio primer entregable', '$500–$5,000 USD', '$0 — riesgo cero'],
                ].map(([dim, comp, yo]) => (
                  <tr key={dim} className="border-b border-[#1a2744] print:border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-[#64748b] print:text-gray-500">{dim}</td>
                    <td className="px-4 py-3 text-[#94a3b8] print:text-gray-600">{comp}</td>
                    <td className="px-4 py-3 text-[#00d4ff] print:text-blue-600 font-medium">{yo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Visión 3 años */}
        <Section title="VISIÓN" subtitle="La marca en 3 años" color="soul">
          <Item
            label="Posición objetivo"
            value="Referente en LATAM de consultoría tecnológica con IA para empresarios. Conocido por entregar resultados reales y medibles, no por tener el sitio web más bonito ni los mejores folletos."
            highlight
          />
          <Item
            label="Referencias de marca"
            value="Apple: simplicidad que esconde complejidad — el cliente no ve las herramientas, ve el resultado. Hormozi: comunicación directa, sin relleno, basada en valor real demostrable."
          />
          <Item
            label="Lo que esta marca NO será nunca"
            value="Una agencia de marketing con promesas vagas. Un freelancer que cobra por hora. Un consultor que vende frameworks sin ejecutar. Siempre: resultados concretos, entregados, medibles."
            highlight
          />
        </Section>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-[#1a2744] print:border-gray-300 flex items-center justify-between">
          <p className="text-[#475569] print:text-gray-400 text-xs">Generado por Raziel — Soul Reaver · Brand Identity</p>
          <p className="text-[#475569] print:text-gray-400 text-xs">{new Date().getFullYear()}</p>
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
  title: string; subtitle: string
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

function Item({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-[#64748b] print:text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm leading-relaxed ${highlight ? 'text-white print:text-black font-medium' : 'text-[#cbd5e1] print:text-gray-700'}`}>
        {value}
      </p>
    </div>
  )
}
