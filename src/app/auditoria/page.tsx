'use client'

import Link from 'next/link'

export default function AuditoriaPage() {
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
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-xs text-[#64748b] tracking-widest uppercase">Raziel — Auditoría de Seguridad</span>
          </div>
          <h1 className="text-3xl font-bold text-white print:text-black mb-2">
            Reporte de Seguridad
          </h1>
          <p className="text-[#64748b] print:text-gray-500 text-sm">
            Auditoría técnica · {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge label="Proyecto" value="Raziel — SaaS Asesor Comercial" color="blue" />
            <Badge label="Stack" value="Next.js 16 + Neon + OpenRouter" color="blue" />
          </div>
        </div>

        {/* Resumen ejecutivo */}
        <div className="mb-8 grid grid-cols-4 gap-3">
          {[
            { level: 'CRÍTICO', count: 2, color: 'red' },
            { level: 'ALTO', count: 2, color: 'orange' },
            { level: 'MEDIO', count: 2, color: 'amber' },
            { level: 'BAJO', count: 2, color: 'green' },
          ].map((item) => (
            <div key={item.level} className={`p-4 rounded-2xl text-center border
              ${item.color === 'red'    ? 'bg-[rgba(239,68,68,0.08)] border-red-500/30'     : ''}
              ${item.color === 'orange' ? 'bg-[rgba(249,115,22,0.08)] border-orange-500/30'  : ''}
              ${item.color === 'amber'  ? 'bg-[rgba(245,158,11,0.08)] border-amber-500/30'   : ''}
              ${item.color === 'green'  ? 'bg-[rgba(52,211,153,0.08)] border-emerald-500/30' : ''}
              print:bg-gray-50 print:border-gray-200`}>
              <p className={`text-2xl font-bold
                ${item.color === 'red'    ? 'text-red-400'      : ''}
                ${item.color === 'orange' ? 'text-orange-400'   : ''}
                ${item.color === 'amber'  ? 'text-amber-400'    : ''}
                ${item.color === 'green'  ? 'text-emerald-400'  : ''}
                print:text-black`}>{item.count}</p>
              <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-widest mt-1">{item.level}</p>
            </div>
          ))}
        </div>

        {/* CRÍTICO */}
        <SectionAudit title="CRÍTICO" color="red">
          <Finding
            id="C-01"
            title="Endpoint /api/chat sin autenticación ni rate limiting"
            severity="CRÍTICO"
            file="src/app/api/chat/route.ts"
            desc="El endpoint POST /api/chat acepta cualquier request sin verificar identidad. Cualquier persona con la URL puede consumir tu API key de Anthropic de forma ilimitada. Un atacante puede vaciar tu crédito en minutos con un script automatizado."
            fix='Agregar rate limiting con la librería "upstash/ratelimit" o middleware de Next.js. A futuro, validar sesión con NextAuth antes de procesar el request.'
            color="red"
          />
          <Finding
            id="C-02"
            title="Sin validación ni sanitización del input del usuario"
            severity="CRÍTICO"
            file="src/app/api/chat/route.ts — línea 6"
            desc='El body del request se parsea directamente: const { messages } = await req.json(). No hay validación de tipo, longitud ni contenido. Un atacante puede enviar mensajes masivos, payloads maliciosos o intentar inyección de prompt para modificar el comportamiento del sistema.'
            fix="Validar con Zod: verificar que messages sea array, cada item tenga role/content válidos, y limitar el tamaño total del payload (ej. máx 20 mensajes, 4000 chars por mensaje)."
            color="red"
          />
        </SectionAudit>

        {/* ALTO */}
        <SectionAudit title="ALTO" color="orange">
          <Finding
            id="A-01"
            title="Sin autenticación — acceso público total a Raziel"
            severity="ALTO"
            file="src/app/page.tsx — aplicación completa"
            desc="No existe ningún mecanismo de login. Cualquiera que acceda a la URL tiene acceso completo a todas las capacidades de Raziel: marketing, finanzas, legal, auditoría. Si el proyecto se despliega en producción, es un sistema completamente abierto."
            fix="Implementar NextAuth.js con provider Email/Password o Google. Proteger todas las rutas con middleware de sesión. Es el siguiente paso crítico antes de producción."
            color="orange"
          />
          <Finding
            id="A-02"
            title="mcpServer experimental habilitado en producción"
            severity="ALTO"
            file="next.config.ts — línea 4"
            desc="experimental.mcpServer: true habilita el servidor MCP de Next.js, una funcionalidad experimental no documentada para producción. Las funciones experimentales pueden tener vulnerabilidades no parcheadas y comportamientos inesperados."
            fix="Deshabilitar en producción si no se usa activamente. Usar variables de entorno para habilitarlo solo en desarrollo: mcpServer: process.env.NODE_ENV === 'development'."
            color="orange"
          />
        </SectionAudit>

        {/* MEDIO */}
        <SectionAudit title="MEDIO" color="amber">
          <Finding
            id="M-01"
            title="API Key de Anthropic sin rotación ni scope limitado"
            severity="MEDIO"
            file=".env.local — ANTHROPIC_API_KEY"
            desc="La API key se usa directamente sin mecanismo de rotación. Si la key se filtra (logs, error messages, git accidental), el atacante tiene acceso completo a tu cuenta de Anthropic sin límite de tiempo."
            fix="Rotar la key periódicamente. Nunca commitear .env.local (verificar que está en .gitignore). Considerar un proxy propio que agregue autenticación antes de llamar a Anthropic."
            color="amber"
          />
          <Finding
            id="M-02"
            title="Sin Content Security Policy ni headers de seguridad HTTP"
            severity="MEDIO"
            file="next.config.ts"
            desc="La aplicación no configura headers de seguridad HTTP: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy. Esto expone la app a ataques XSS y clickjacking."
            fix="Agregar security headers en next.config.ts mediante la opción headers(). Next.js tiene soporte nativo — se configura en 10 líneas."
            color="amber"
          />
        </SectionAudit>

        {/* BAJO */}
        <SectionAudit title="BAJO" color="green">
          <Finding
            id="B-01"
            title="System prompt visible en el bundle del servidor"
            severity="BAJO"
            file="src/features/raziel/lib/system-prompt.ts"
            desc="El system prompt completo de Raziel — incluyendo metodología, capacidades y comportamiento — está en texto plano en el servidor. No es un riesgo de seguridad directo, pero si alguien accede al servidor, puede extraer toda la lógica del agente."
            fix="Mover el system prompt a una variable de entorno o a la base de datos Neon con acceso controlado. Bajo prioridad por ahora."
            color="green"
          />
          <Finding
            id="B-02"
            title="Sin logging de requests ni monitoreo de errores"
            severity="BAJO"
            file="src/app/api/chat/route.ts"
            desc="No hay registro de requests al endpoint de chat. Si ocurre un abuso o error en producción, no hay forma de detectarlo ni investigarlo post-mortem."
            fix="Agregar logging básico: timestamp, IP (hasheada por privacidad), tokens consumidos. A futuro integrar Sentry o Vercel Analytics para monitoreo."
            color="green"
          />
        </SectionAudit>

        {/* Plan de remediación */}
        <div className="mb-8 p-5 rounded-2xl bg-[#0d1117] border border-[#1a2744] print:bg-white print:border-gray-200">
          <p className="text-xs text-[#00d4ff] print:text-blue-600 uppercase tracking-widest font-semibold mb-4">Plan de Remediación — Por Prioridad</p>
          <div className="space-y-2">
            {[
              { orden: '1', accion: 'Validar input con Zod en /api/chat', impacto: 'Elimina C-02', tiempo: '1 hora' },
              { orden: '2', accion: 'Agregar rate limiting al endpoint', impacto: 'Elimina C-01', tiempo: '2 horas' },
              { orden: '3', accion: 'Implementar NextAuth.js', impacto: 'Elimina A-01', tiempo: '1 día' },
              { orden: '4', accion: 'Desactivar mcpServer en producción', impacto: 'Elimina A-02', tiempo: '5 minutos' },
              { orden: '5', accion: 'Agregar security headers en next.config.ts', impacto: 'Elimina M-02', tiempo: '30 minutos' },
              { orden: '6', accion: 'Política de rotación de API keys', impacto: 'Reduce M-01', tiempo: 'Proceso' },
            ].map((item) => (
              <div key={item.orden} className="flex items-center gap-3 py-2 border-b border-[#1a2744] print:border-gray-100 last:border-0">
                <span className="w-6 h-6 rounded-full bg-[#1a2744] print:bg-gray-200 flex items-center justify-center text-[#00d4ff] print:text-blue-600 text-xs font-bold flex-shrink-0">{item.orden}</span>
                <span className="text-[#e2e8f0] print:text-black text-sm flex-1">{item.accion}</span>
                <span className="text-emerald-400 print:text-green-600 text-xs flex-shrink-0">{item.impacto}</span>
                <span className="text-[#475569] print:text-gray-400 text-xs flex-shrink-0 w-20 text-right">{item.tiempo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conclusión */}
        <div className="p-5 rounded-2xl bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.2)] print:bg-blue-50 print:border-blue-200">
          <p className="text-xs text-[#00d4ff] print:text-blue-600 uppercase tracking-widest font-semibold mb-2">Conclusión</p>
          <p className="text-[#cbd5e1] print:text-gray-700 text-sm leading-relaxed">
            Raziel es un proyecto sólido para uso interno y desarrollo. Los riesgos críticos son reales pero todos tienen solución directa y rápida. Antes de cualquier despliegue en producción con usuarios externos, los ítems C-01, C-02 y A-01 son bloqueantes. El resto puede implementarse de forma progresiva sin detener el desarrollo.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-[#1a2744] print:border-gray-300 flex items-center justify-between">
          <p className="text-[#475569] print:text-gray-400 text-xs">Generado por Raziel — Soul Reaver · Auditoría de Seguridad</p>
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

function Badge({ label, value, color }: { label: string; value: string; color: 'blue' | 'red' }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs
      ${color === 'blue' ? 'bg-[rgba(14,165,233,0.1)] border-[rgba(14,165,233,0.3)] text-[#0ea5e9]' : ''}
      ${color === 'red'  ? 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-red-400'     : ''}
      print:bg-gray-100 print:border-gray-300 print:text-gray-700`}>
      <span className="font-semibold">{label}:</span> {value}
    </div>
  )
}

function SectionAudit({ title, color, children }: { title: string; color: 'red' | 'orange' | 'amber' | 'green'; children: React.ReactNode }) {
  const styles = {
    red:    { border: 'border-red-500/30',     text: 'text-red-400',     dot: 'bg-red-500' },
    orange: { border: 'border-orange-500/30',  text: 'text-orange-400',  dot: 'bg-orange-500' },
    amber:  { border: 'border-amber-500/30',   text: 'text-amber-400',   dot: 'bg-amber-500' },
    green:  { border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  }
  const s = styles[color]
  return (
    <div className={`mb-8 p-5 rounded-2xl bg-[#0d1117] border ${s.border} print:bg-white print:border-gray-200`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${s.dot} print:hidden`} />
        <span className={`text-[10px] ${s.text} print:text-gray-500 uppercase tracking-widest font-bold`}>{title}</span>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Finding({ id, title, severity, file, desc, fix, color }: {
  id: string; title: string; severity: string; file: string
  desc: string; fix: string; color: 'red' | 'orange' | 'amber' | 'green'
}) {
  const badge = {
    red:    'bg-[rgba(239,68,68,0.15)] text-red-400 border-red-500/30',
    orange: 'bg-[rgba(249,115,22,0.15)] text-orange-400 border-orange-500/30',
    amber:  'bg-[rgba(245,158,11,0.15)] text-amber-400 border-amber-500/30',
    green:  'bg-[rgba(52,211,153,0.15)] text-emerald-400 border-emerald-500/30',
  }
  return (
    <div className="p-4 rounded-xl bg-[#060810] border border-[#1a2744] print:bg-gray-50 print:border-gray-100">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-[#475569] print:text-gray-400 text-xs font-mono mt-0.5 flex-shrink-0">{id}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-[#e2e8f0] print:text-black text-sm font-semibold">{title}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold tracking-widest ${badge[color]} print:bg-gray-100 print:border-gray-300 print:text-gray-700`}>
              {severity}
            </span>
          </div>
          <p className="text-[#475569] print:text-gray-400 text-[11px] font-mono">{file}</p>
        </div>
      </div>
      <div className="space-y-2 pl-7">
        <div>
          <p className="text-[#64748b] print:text-gray-500 text-[10px] uppercase tracking-wider mb-1">Riesgo</p>
          <p className="text-[#94a3b8] print:text-gray-700 text-xs leading-relaxed">{desc}</p>
        </div>
        <div>
          <p className="text-emerald-400 print:text-green-600 text-[10px] uppercase tracking-wider mb-1">Remediación</p>
          <p className="text-[#94a3b8] print:text-gray-700 text-xs leading-relaxed">{fix}</p>
        </div>
      </div>
    </div>
  )
}
