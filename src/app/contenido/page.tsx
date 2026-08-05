'use client'

import Link from 'next/link'

export default function ContenidoPage() {
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
            <span className="text-xs text-[#64748b] tracking-widest uppercase">Raziel — Estrategia de Contenido</span>
          </div>
          <h1 className="text-3xl font-bold text-white print:text-black mb-2">Estrategia de Contenido</h1>
          <p className="text-[#64748b] print:text-gray-500 text-sm">
            Autoridad primero · Leads como consecuencia · {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] print:bg-gray-100 print:border-gray-300">
            <span className="text-[#00d4ff] print:text-gray-700 text-xs font-semibold tracking-wide">HORIZONTE 6 MESES · PARTIENDO DE CERO</span>
          </div>
        </div>

        {/* Diagnóstico */}
        <Section title="DIAGNÓSTICO" subtitle="Situación de partida" color="amber">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Audiencia actual', value: '0', sub: 'Partimos de cero' },
              { label: 'Clientes objetivo', value: '3–5', sub: 'Activos simultáneos' },
              { label: 'Ingreso objetivo', value: '$7,500', sub: 'USD/mes techo' },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200 text-center">
                <p className="text-2xl font-bold text-white print:text-black">{item.value}</p>
                <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-wider mt-0.5">{item.label}</p>
                <p className="text-[#475569] print:text-gray-400 text-[10px] mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-[rgba(245,158,11,0.06)] border border-amber-500/20 print:bg-yellow-50 print:border-yellow-200">
            <p className="text-amber-400 print:text-yellow-700 text-xs font-semibold uppercase tracking-wider mb-1">Ventaja real que pocos tienen</p>
            <p className="text-[#cbd5e1] print:text-gray-700 text-sm">Raziel produce contenido en horas. No necesitas equipo ni agencia — tienes el sistema internamente. Eso te permite publicar con consistencia que otros no pueden sostener.</p>
          </div>
        </Section>

        {/* Plataformas */}
        <Section title="PLATAFORMAS" subtitle="Dónde construir y en qué orden" color="blue">
          <div className="space-y-3">
            {[
              {
                plat: 'LinkedIn',
                prioridad: 'PRIMARIA',
                color: 'blue',
                razon: 'Tu avatar — el empresario 32-50 años — toma decisiones de negocio en LinkedIn. Es donde busca referentes antes de pagar.',
                tipo: 'Carruseles, posts de texto, casos de éxito, reflexiones de negocio',
                freq: '4–5 posts por semana',
              },
              {
                plat: 'WhatsApp / Grupos de empresarios',
                prioridad: 'SECUNDARIA',
                color: 'green',
                razon: 'Canal de distribución directo. Un MVP gratis compartido en el grupo correcto puede generar 3–5 leads calificados de inmediato.',
                tipo: 'Casos de éxito cortos, invitación a MVP gratuito, valor directo sin venta',
                freq: '1–2 veces por semana por grupo',
              },
              {
                plat: 'YouTube / Video',
                prioridad: 'FASE 2 (mes 4+)',
                color: 'amber',
                razon: 'Motor de búsqueda a largo plazo. Videos de "cómo automaticé X proceso en Y días" generan leads entrantes de forma pasiva.',
                tipo: 'Videos de proceso, antes/después, demos en pantalla',
                freq: '1 video por semana al activar',
              },
            ].map((p) => (
              <div key={p.plat} className="p-4 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[#e2e8f0] print:text-black font-semibold text-sm">{p.plat}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest border
                    ${p.color === 'blue'  ? 'text-[#0ea5e9] border-[#0ea5e9]/30 bg-[rgba(14,165,233,0.1)]' : ''}
                    ${p.color === 'green' ? 'text-emerald-400 border-emerald-400/30 bg-[rgba(52,211,153,0.1)]' : ''}
                    ${p.color === 'amber' ? 'text-amber-400 border-amber-400/30 bg-[rgba(245,158,11,0.1)]' : ''}
                    print:bg-gray-100 print:border-gray-300 print:text-gray-700`}>
                    {p.prioridad}
                  </span>
                </div>
                <p className="text-[#94a3b8] print:text-gray-600 text-xs mb-2">{p.razon}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-[#64748b] print:text-gray-500"><span className="text-[#475569]">Tipo:</span> {p.tipo}</span>
                </div>
                <p className="text-[#64748b] print:text-gray-500 text-xs mt-1"><span className="text-[#475569]">Frecuencia:</span> {p.freq}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Pilares de contenido */}
        <Section title="PILARES" subtitle="Los 4 temas que dominas" color="soul">
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: '⚙️',
                pilar: 'Transformación de Procesos',
                desc: 'Mostrar cómo un proceso manual se convierte en sistema automatizado. El antes y el después. Esto habla directamente al dolor del avatar.',
                ejemplos: '"De WhatsApp a CRM en 15 días", "Cómo dejé de perder leads por Excel"',
              },
              {
                icon: '🏗️',
                pilar: 'Arquitectura sin Código',
                desc: 'Desmitificar la tecnología para el empresario no técnico. Mostrar que un SaaS no requiere saber programar para tenerlo.',
                ejemplos: '"Qué es un MVP y por qué tu negocio lo necesita", "El stack que uso para construir en horas"',
              },
              {
                icon: '💰',
                pilar: 'ROI y Números Reales',
                desc: 'Cuánto le cuesta al empresario NO automatizar. Leads perdidos × ticket promedio = dolor financiero visible.',
                ejemplos: '"¿Cuánto te cuesta ese proceso manual al mes?", "El cálculo que mis clientes no habían hecho"',
              },
              {
                icon: '🧠',
                pilar: 'Filosofía de Negocio',
                desc: 'Posicionamiento como pensador, no solo como proveedor. Reflexiones sobre sistemas, escala y el Modelo B.',
                ejemplos: '"Por qué entrego gratis el primero", "La diferencia entre tener clientes y tener un sistema"',
              },
            ].map((p) => (
              <div key={p.pilar} className="p-4 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                <span className="text-2xl">{p.icon}</span>
                <p className="text-[#e2e8f0] print:text-black font-semibold text-sm mt-2 mb-1">{p.pilar}</p>
                <p className="text-[#94a3b8] print:text-gray-600 text-xs leading-relaxed mb-2">{p.desc}</p>
                <p className="text-[#475569] print:text-gray-400 text-[11px] italic">{p.ejemplos}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Embudo TOFU/MOFU/BOFU */}
        <Section title="EMBUDO" subtitle="Contenido por etapa del cliente" color="green">
          <div className="space-y-3">
            {[
              {
                etapa: 'TOFU — Atracción',
                sub: 'El avatar no te conoce todavía',
                color: 'blue',
                objetivo: 'Visibilidad y reconocimiento',
                contenido: [
                  'Posts sobre el dolor: "5 señales de que tu negocio necesita automatización"',
                  'Estadísticas impactantes: "El empresario promedio pierde X leads al mes por falta de sistema"',
                  'Preguntas que abren reflexión: "¿Cuánto vale una hora de tu tiempo perdida en Excel?"',
                ],
              },
              {
                etapa: 'MOFU — Consideración',
                sub: 'Ya te conoce, está evaluando',
                color: 'amber',
                objetivo: 'Construir autoridad y confianza',
                contenido: [
                  'Casos de éxito: proceso del cliente antes y después, en números',
                  'Detrás de cámaras: cómo construyes una solución en 15 días',
                  'Comparativas: "Agencia vs. Consultor con IA — diferencias reales"',
                ],
              },
              {
                etapa: 'BOFU — Conversión',
                sub: 'Listo para tomar decisión',
                color: 'green',
                objetivo: 'Generar la conversación de venta',
                contenido: [
                  'El MVP gratuito como CTA principal: "¿Tienes un proceso que quieres automatizar? Escríbeme."',
                  'Testimonios y resultados con métricas reales',
                  'Respuestas a objeciones directas: "¿Por qué gratis el primero?"',
                ],
              },
            ].map((e) => (
              <div key={e.etapa} className="p-4 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`text-xs font-bold tracking-widest uppercase
                      ${e.color === 'blue'  ? 'text-[#0ea5e9]' : ''}
                      ${e.color === 'amber' ? 'text-amber-400' : ''}
                      ${e.color === 'green' ? 'text-emerald-400' : ''}
                      print:text-gray-700`}>{e.etapa}</p>
                    <p className="text-[#475569] print:text-gray-400 text-xs">{e.sub}</p>
                  </div>
                  <span className="text-[#64748b] print:text-gray-500 text-xs">→ {e.objetivo}</span>
                </div>
                <ul className="space-y-1.5">
                  {e.contenido.map((c) => (
                    <li key={c} className="flex gap-2 text-xs text-[#94a3b8] print:text-gray-600">
                      <span className="text-[#1a2744] print:text-gray-300 flex-shrink-0">—</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Repurposing */}
        <Section title="REPURPOSING" subtitle="Un contenido, múltiples formatos" color="amber">
          <div className="p-4 rounded-xl bg-[rgba(245,158,11,0.06)] border border-amber-500/20 print:bg-yellow-50 print:border-yellow-200 mb-3">
            <p className="text-amber-400 print:text-yellow-700 text-xs font-semibold uppercase tracking-wider mb-2">El sistema de producción</p>
            <p className="text-[#cbd5e1] print:text-gray-700 text-sm">Raziel produce el contenido base. Tú lo validas. Se distribuye en múltiples formatos sin esfuerzo adicional.</p>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#1a2744] print:border-gray-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#0d1117] print:bg-gray-100 border-b border-[#1a2744] print:border-gray-200">
                  <th className="text-left px-4 py-2.5 text-[#64748b] print:text-gray-500 uppercase tracking-wider font-semibold">Contenido raíz</th>
                  <th className="text-left px-4 py-2.5 text-[#64748b] print:text-gray-500 uppercase tracking-wider font-semibold">Se convierte en</th>
                </tr>
              </thead>
              <tbody className="bg-[#060810] print:bg-white">
                {[
                  ['Caso de éxito de un cliente (Raziel lo redacta)', 'Post LinkedIn + hilo Twitter + mensaje WhatsApp + video guión'],
                  ['Reflexión de negocio (5 min de tu parte)', 'Post LinkedIn + carrusel visual + historia Instagram'],
                  ['Demo de una solución construida', 'Video YouTube + clip corto LinkedIn + post con capturas'],
                  ['Respuesta a una objeción real', 'Post LinkedIn + FAQ del sitio + mensaje para seguimiento de leads'],
                ].map(([raiz, destinos]) => (
                  <tr key={raiz} className="border-b border-[#1a2744] print:border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-[#e2e8f0] print:text-black">{raiz}</td>
                    <td className="px-4 py-3 text-[#94a3b8] print:text-gray-600">{destinos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Plan 90 días */}
        <Section title="PLAN 90 DÍAS" subtitle="Acción concreta por fase" color="red">
          <div className="space-y-3">
            {[
              {
                mes: 'MES 1',
                titulo: 'Cimientos',
                objetivo: 'Perfil optimizado + primeros 12 posts + 1 primer cliente por red de contactos',
                acciones: [
                  'Optimizar LinkedIn: foto, titular, resumen con propuesta de valor clara',
                  'Publicar 3 posts por semana — Pilar 1 (Transformación) y Pilar 4 (Filosofía)',
                  'Contactar directamente a 10 empresarios del círculo cercano con la oferta del MVP gratuito',
                  'Documentar el primer proyecto (antes/después) para usarlo como caso de éxito',
                ],
              },
              {
                mes: 'MES 2',
                titulo: 'Autoridad',
                objetivo: 'Primer caso de éxito publicado + 50 conexiones calificadas + 1–2 clientes activos',
                acciones: [
                  'Publicar el primer caso de éxito real con métricas (leads recuperados, tiempo ahorrado)',
                  'Aumentar a 4–5 posts por semana incorporando Pilar 2 (Arquitectura) y Pilar 3 (ROI)',
                  'Participar en 3 grupos de WhatsApp de empresarios — dar valor, no vender',
                  'Solicitar referidos a los primeros clientes satisfechos',
                ],
              },
              {
                mes: 'MES 3',
                titulo: 'Flujo',
                objetivo: 'Sistema de contenido funcionando solo + leads entrantes constantes + 3–5 clientes activos',
                acciones: [
                  'El contenido ya genera inbound — responder y convertir esas conversaciones',
                  'Evaluar activar YouTube con la primera demo de proceso',
                  'Implementar seguimiento sistemático a leads que interactúan con el contenido',
                  'Medir: tasa de conversión MVP → cliente de pago y ajustar el mensaje si es necesario',
                ],
              },
            ].map((fase) => (
              <div key={fase.mes} className="p-4 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-red-400 print:text-red-600 text-[10px] font-bold tracking-widest uppercase">{fase.mes}</span>
                  <span className="text-white print:text-black font-semibold text-sm">— {fase.titulo}</span>
                </div>
                <p className="text-[#64748b] print:text-gray-500 text-xs mb-3 italic">{fase.objetivo}</p>
                <ul className="space-y-1.5">
                  {fase.acciones.map((a) => (
                    <li key={a} className="flex gap-2 text-xs text-[#94a3b8] print:text-gray-600">
                      <span className="text-red-400 print:text-red-500 flex-shrink-0 mt-0.5">→</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* KPIs */}
        <Section title="KPIs" subtitle="Cómo medir que la estrategia funciona" color="soul">
          <div className="grid grid-cols-2 gap-3">
            {[
              { metrica: 'Alcance semanal LinkedIn', meta: 'Mes 1: 500 · Mes 3: 5,000+', tipo: 'Visibilidad' },
              { metrica: 'Conexiones calificadas', meta: 'Mes 1: 50 · Mes 3: 300+', tipo: 'Audiencia' },
              { metrica: 'Conversaciones de venta', meta: '3–5 por semana desde mes 2', tipo: 'Pipeline' },
              { metrica: 'Tasa MVP → cliente pago', meta: 'Objetivo: 30%+', tipo: 'Conversión' },
              { metrica: 'Clientes activos', meta: 'Mes 3: 3–5 simultáneos', tipo: 'Negocio' },
              { metrica: 'Ingreso mensual', meta: 'Mes 3: $3,000+ USD', tipo: 'Financiero' },
            ].map((k) => (
              <div key={k.metrica} className="p-3 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                <p className="text-[#475569] print:text-gray-400 text-[10px] uppercase tracking-wider">{k.tipo}</p>
                <p className="text-[#e2e8f0] print:text-black text-xs font-medium mt-0.5">{k.metrica}</p>
                <p className="text-[#00d4ff] print:text-blue-600 text-xs mt-1">{k.meta}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-[#1a2744] print:border-gray-300 flex items-center justify-between">
          <p className="text-[#475569] print:text-gray-400 text-xs">Generado por Raziel — Soul Reaver · Metodología Hormozi</p>
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
