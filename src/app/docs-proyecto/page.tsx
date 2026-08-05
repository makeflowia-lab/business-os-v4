'use client'

import Link from 'next/link'
import { useState } from 'react'

type Status = 'pendiente' | 'en-progreso' | 'listo'

interface DocItem {
  id: string
  doc: string
  descripcion: string
  prioridad: 'CRÍTICO' | 'ALTO' | 'MEDIO'
  estado: Status
}

const DOCS_INICIALES: DocItem[] = [
  // Infraestructura
  { id: '1', doc: 'Arquitectura del sistema', descripcion: 'Diagrama de componentes: frontend, backend, base de datos, AI engine, CDN. Decisiones técnicas documentadas.', prioridad: 'CRÍTICO', estado: 'listo' },
  { id: '2', doc: 'Variables de entorno', descripcion: '.env.example con todas las variables requeridas, sin valores reales. Instrucciones de configuración por ambiente.', prioridad: 'CRÍTICO', estado: 'listo' },
  { id: '3', doc: 'Guía de despliegue', descripcion: 'Paso a paso para deploy en Vercel: configuración, variables, dominio custom, SSL automático.', prioridad: 'CRÍTICO', estado: 'pendiente' },
  { id: '4', doc: 'Configuración de base de datos', descripcion: 'Schema de Neon PostgreSQL, migraciones, conexión serverless, backups automáticos.', prioridad: 'CRÍTICO', estado: 'pendiente' },

  // APIs y integraciones
  { id: '5', doc: 'Documentación de API interna', descripcion: 'Endpoints disponibles: /api/chat, /api/auth. Métodos, payloads, respuestas, códigos de error.', prioridad: 'ALTO', estado: 'pendiente' },
  { id: '6', doc: 'Guía de integración Anthropic', descripcion: 'Cómo se conecta con Claude Sonnet, rate limits, manejo de tokens, costos por request.', prioridad: 'ALTO', estado: 'pendiente' },
  { id: '7', doc: 'Política de rate limiting', descripcion: 'Límites actuales (20 req/min por IP), cómo escalar, qué pasa cuando se excede.', prioridad: 'ALTO', estado: 'listo' },

  // Seguridad
  { id: '8', doc: 'Política de seguridad', descripcion: 'Headers HTTP configurados, autenticación JWT, validación de inputs con Zod, manejo de API keys.', prioridad: 'CRÍTICO', estado: 'listo' },
  { id: '9', doc: 'Política de rotación de secrets', descripcion: 'Frecuencia de rotación de ANTHROPIC_API_KEY y NEXTAUTH_SECRET. Proceso de actualización sin downtime.', prioridad: 'ALTO', estado: 'pendiente' },
  { id: '10', doc: 'Plan de respuesta a incidentes', descripcion: 'Qué hacer si se filtra una API key, si hay un breach, si el servicio cae. Contactos y pasos de escalación.', prioridad: 'MEDIO', estado: 'pendiente' },

  // Legal y privacidad
  { id: '11', doc: 'Términos y Condiciones', descripcion: 'Documento legal para usuarios del servicio. Incluye limitación de responsabilidad por uso de IA.', prioridad: 'CRÍTICO', estado: 'listo' },
  { id: '12', doc: 'Aviso de Privacidad (LFPDPPP)', descripcion: 'Cumplimiento con ley mexicana de protección de datos. Derechos ARCO, finalidades, transferencias.', prioridad: 'CRÍTICO', estado: 'listo' },
  { id: '13', doc: 'Contrato de Servicio B2B', descripcion: 'Contrato entre el consultor y sus clientes. Fases, pagos, IP, garantías, terminación.', prioridad: 'CRÍTICO', estado: 'listo' },
  { id: '14', doc: 'NDA / Acuerdo de Confidencialidad', descripcion: 'Protección de información del cliente y de la tecnología propietaria Raziel.', prioridad: 'CRÍTICO', estado: 'listo' },
  { id: '15', doc: 'Política de uso de IA', descripcion: 'Cómo se usa la IA internamente, qué datos procesa, qué terceros intervienen (Anthropic), limitaciones.', prioridad: 'ALTO', estado: 'pendiente' },

  // Operación y SLA
  { id: '16', doc: 'Política de uptime y monitoreo', descripcion: 'Qué se monitorea, con qué herramienta, umbrales de alerta, canales de notificación.', prioridad: 'MEDIO', estado: 'pendiente' },
  { id: '17', doc: 'Runbook de operaciones', descripcion: 'Procedimientos de rutina: deploy, rollback, escalado, limpieza de logs, renovación de certificados.', prioridad: 'MEDIO', estado: 'pendiente' },
  { id: '18', doc: 'Política de backups', descripcion: 'Frecuencia, retención y proceso de restauración de datos en Neon. Prueba de restauración documentada.', prioridad: 'ALTO', estado: 'pendiente' },

  // Producto
  { id: '19', doc: 'README del proyecto', descripcion: 'Descripción, stack, setup local, comandos principales, estructura de carpetas. Para onboarding rápido.', prioridad: 'ALTO', estado: 'pendiente' },
  { id: '20', doc: 'Changelog y versioning', descripcion: 'Historial de versiones con cambios por release. Formato semántico (MAJOR.MINOR.PATCH).', prioridad: 'MEDIO', estado: 'pendiente' },
  { id: '21', doc: 'Guía de contribución', descripcion: 'Convenciones de código, proceso de PR, estándares de commits, cómo agregar nuevos módulos.', prioridad: 'MEDIO', estado: 'pendiente' },
]

const PRIORIDAD_COLOR = {
  'CRÍTICO': { badge: 'text-red-400 border-red-500/30 bg-[rgba(239,68,68,0.1)]', print: 'print:text-red-600' },
  'ALTO':    { badge: 'text-amber-400 border-amber-500/30 bg-[rgba(245,158,11,0.1)]', print: 'print:text-yellow-600' },
  'MEDIO':   { badge: 'text-[#0ea5e9] border-[#0ea5e9]/30 bg-[rgba(14,165,233,0.1)]', print: 'print:text-blue-600' },
}

const ESTADO_COLOR: Record<Status, string> = {
  'listo':      'text-emerald-400 border-emerald-500/30 bg-[rgba(52,211,153,0.1)]',
  'en-progreso':'text-amber-400 border-amber-500/30 bg-[rgba(245,158,11,0.1)]',
  'pendiente':  'text-[#475569] border-[#1a2744] bg-[#0d1117]',
}

const ESTADO_LABEL: Record<Status, string> = {
  'listo':       '✓ Listo',
  'en-progreso': '⟳ En progreso',
  'pendiente':   '○ Pendiente',
}

export default function DocsProyectoPage() {
  const [docs, setDocs]       = useState<DocItem[]>(DOCS_INICIALES)
  const [filtro, setFiltro]   = useState<'todos' | 'pendiente' | 'listo'>('todos')
  const handlePrint           = () => window.print()

  const toggleEstado = (id: string) => {
    setDocs(prev => prev.map(d => {
      if (d.id !== id) return d
      const next: Status = d.estado === 'pendiente' ? 'en-progreso' : d.estado === 'en-progreso' ? 'listo' : 'pendiente'
      return { ...d, estado: next }
    }))
  }

  const filtrados = docs.filter(d =>
    filtro === 'todos' ? true : filtro === 'listo' ? d.estado === 'listo' : d.estado !== 'listo'
  )

  const listos    = docs.filter(d => d.estado === 'listo').length
  const progreso  = Math.round((listos / docs.length) * 100)

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
        <div className="mb-8 pb-6 border-b border-[#1a2744] print:border-gray-300">
          <div className="flex items-center gap-3 mb-4 print:hidden">
            <div className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
            <span className="text-xs text-[#64748b] tracking-widest uppercase">Raziel — Documentación CLOUD</span>
          </div>
          <h1 className="text-3xl font-bold text-white print:text-black mb-2">Checklist de Documentación</h1>
          <p className="text-[#64748b] print:text-gray-500 text-sm">
            CLOUD · SaaS Multi-tenant · Vercel + Neon · {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Progreso */}
        <div className="mb-8 p-5 rounded-2xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white print:text-black">Progreso general</p>
            <p className="text-[#00d4ff] print:text-blue-600 font-bold">{listos}/{docs.length} documentos</p>
          </div>
          <div className="h-2 bg-[#1a2744] print:bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00d4ff] print:bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-[#475569] print:text-gray-400 text-xs">{progreso}% completado</p>
            <p className="text-[#475569] print:text-gray-400 text-xs">{docs.length - listos} pendientes</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="no-print flex gap-2 mb-6">
          {(['todos', 'pendiente', 'listo'] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFiltro(f)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold tracking-widest uppercase transition-all duration-200
                ${filtro === f
                  ? 'bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.4)] text-[#00d4ff]'
                  : 'border border-[#1a2744] text-[#475569] hover:text-[#94a3b8]'}`}>
              {f === 'todos' ? 'Todos' : f === 'listo' ? 'Listos' : 'Pendientes'}
            </button>
          ))}
        </div>

        {/* Lista por categoría */}
        {[
          { cat: 'Infraestructura y Deploy',  ids: ['1','2','3','4'] },
          { cat: 'APIs e Integraciones',       ids: ['5','6','7'] },
          { cat: 'Seguridad',                  ids: ['8','9','10'] },
          { cat: 'Legal y Privacidad',         ids: ['11','12','13','14','15'] },
          { cat: 'Operación',                  ids: ['16','17','18'] },
          { cat: 'Producto',                   ids: ['19','20','21'] },
        ].map(({ cat, ids }) => {
          const items = filtrados.filter(d => ids.includes(d.id))
          if (items.length === 0) return null
          return (
            <div key={cat} className="mb-8">
              <p className="text-xs text-[#00d4ff] print:text-blue-600 uppercase tracking-widest font-bold mb-3">{cat}</p>
              <div className="space-y-2">
                {items.map((doc) => (
                  <div key={doc.id}
                    className="p-4 rounded-xl bg-[#0d1117] border border-[#1a2744] print:bg-gray-50 print:border-gray-200">
                    <div className="flex items-start gap-3">
                      {/* Toggle estado */}
                      <button
                        type="button"
                        onClick={() => toggleEstado(doc.id)}
                        className={`no-print flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center text-[10px] transition-all duration-200 ${ESTADO_COLOR[doc.estado]}`}
                        title="Cambiar estado"
                      >
                        {doc.estado === 'listo' ? '✓' : doc.estado === 'en-progreso' ? '⟳' : ''}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className={`text-sm font-medium transition-colors ${doc.estado === 'listo' ? 'text-[#64748b] print:text-gray-400 line-through' : 'text-[#e2e8f0] print:text-black'}`}>
                            {doc.doc}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold tracking-widest ${PRIORIDAD_COLOR[doc.prioridad].badge} print:bg-gray-100 print:border-gray-300 print:text-gray-600`}>
                            {doc.prioridad}
                          </span>
                          <span className={`no-print text-[10px] px-2 py-0.5 rounded-full border ${ESTADO_COLOR[doc.estado]}`}>
                            {ESTADO_LABEL[doc.estado]}
                          </span>
                        </div>
                        <p className="text-[#64748b] print:text-gray-500 text-xs leading-relaxed">{doc.descripcion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Resumen por prioridad */}
        <div className="mt-8 p-5 rounded-2xl bg-[#0d1117] border border-[#1a2744] print:bg-white print:border-gray-200">
          <p className="text-xs text-[#00d4ff] print:text-blue-600 uppercase tracking-widest font-bold mb-4">Resumen por prioridad</p>
          <div className="grid grid-cols-3 gap-3">
            {(['CRÍTICO', 'ALTO', 'MEDIO'] as const).map((p) => {
              const total   = docs.filter(d => d.prioridad === p).length
              const hechos  = docs.filter(d => d.prioridad === p && d.estado === 'listo').length
              return (
                <div key={p} className="p-3 rounded-xl bg-[#060810] border border-[#1a2744] print:bg-gray-50 print:border-gray-200 text-center">
                  <p className={`text-lg font-bold ${PRIORIDAD_COLOR[p].badge.split(' ')[0]} print:text-black`}>
                    {hechos}/{total}
                  </p>
                  <p className={`text-[10px] uppercase tracking-widest mt-0.5 ${PRIORIDAD_COLOR[p].badge.split(' ')[0]} print:text-gray-500`}>{p}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-[#1a2744] print:border-gray-300 flex items-center justify-between">
          <p className="text-[#475569] print:text-gray-400 text-xs">Generado por Raziel — Soul Reaver · CLOUD SaaS</p>
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
