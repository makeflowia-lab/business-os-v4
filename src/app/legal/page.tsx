'use client'

import Link from 'next/link'
import { useState } from 'react'

const DOCS = ['Contrato', 'NDA', 'Privacidad', 'Términos'] as const
type Doc = typeof DOCS[number]

const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
const año   = new Date().getFullYear()

export default function LegalPage() {
  const [active, setActive] = useState<Doc>('Contrato')
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

      {/* Tabs */}
      <div className="no-print flex gap-2 px-6 py-4 border-b border-[#1a2744] bg-[#0d1117]/40 sticky top-[52px] z-10 overflow-x-auto">
        {DOCS.map((doc) => (
          <button key={doc} type="button" onClick={() => setActive(doc)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-widest uppercase transition-all duration-200 whitespace-nowrap
              ${active === doc
                ? 'bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.4)] text-[#00d4ff]'
                : 'border border-[#1a2744] text-[#475569] hover:text-[#94a3b8]'}`}>
            {doc}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 print:py-6 print:px-8">

        {/* ── CONTRATO ── */}
        {active === 'Contrato' && (
          <DocSection title="Contrato de Prestación de Servicios" subtitle="Consultoría Comercial con IA" badge="B2B · México" fecha={fecha}>
            <Legal>
              <Clause num="1" title="PARTES">
                <p>El presente contrato se celebra entre:</p>
                <p><strong>PRESTADOR:</strong> [Tu nombre o razón social], con domicilio en México, en adelante "El Consultor".</p>
                <p><strong>CLIENTE:</strong> [Nombre del cliente / empresa], con domicilio en [ciudad, país], en adelante "El Cliente".</p>
              </Clause>

              <Clause num="2" title="OBJETO DEL CONTRATO">
                <p>El Consultor se obliga a prestar servicios de consultoría comercial y desarrollo de soluciones tecnológicas a la medida, utilizando herramientas de inteligencia artificial de forma interna. Los entregables específicos se detallarán en cada Propuesta de Proyecto aceptada por ambas partes.</p>
                <p>El Cliente reconoce que los servicios se prestan en modalidad Modelo B: El Consultor usa herramientas internas propias para producir los entregables. Las herramientas utilizadas son confidenciales y no forman parte del entregable.</p>
              </Clause>

              <Clause num="3" title="FASES Y ENTREGABLES">
                <p><strong>Fase 1 — MVP:</strong> Prototipo funcional entregado en 15 días naturales o menos desde el inicio del proyecto, sin costo para el Cliente. El Cliente evaluará el MVP en un plazo máximo de 5 días hábiles.</p>
                <p><strong>Fase 2 — Solución Completa:</strong> Condicional a aprobación del MVP por parte del Cliente. Entrega en 30 días naturales desde la confirmación por escrito del Cliente. Precio fijo acordado en la Propuesta de Proyecto.</p>
              </Clause>

              <Clause num="4" title="PRECIO Y FORMA DE PAGO">
                <p>El MVP de Fase 1 es gratuito. El precio de la Fase 2 se establece en la Propuesta de Proyecto firmada por ambas partes.</p>
                <p>Forma de pago: 50% al inicio de la Fase 2 y 50% contra entrega. El pago se realiza mediante transferencia bancaria o el medio acordado entre las partes. Los precios se expresan en dólares estadounidenses (USD) o pesos mexicanos (MXN) según se especifique en la Propuesta.</p>
                <p>Los pagos no son reembolsables una vez iniciada la Fase 2, salvo incumplimiento imputable al Consultor.</p>
              </Clause>

              <Clause num="5" title="PROPIEDAD INTELECTUAL">
                <p>Una vez cubierto el pago total de la Fase 2, el Cliente adquiere los derechos de uso de los entregables desarrollados específicamente para su proyecto.</p>
                <p>El Consultor conserva en todo momento: (a) la propiedad del sistema interno Raziel y sus componentes; (b) las metodologías, procesos y conocimientos propios utilizados; (c) cualquier componente reutilizable o de carácter general. El Cliente no adquiere derechos sobre las herramientas internas del Consultor.</p>
                <p>Los componentes open source incluidos en los entregables están sujetos a sus licencias originales.</p>
              </Clause>

              <Clause num="6" title="CONFIDENCIALIDAD">
                <p>Ambas partes se obligan a mantener confidencial toda información técnica, comercial y estratégica que reciban en el marco de este contrato. Esta obligación es recíproca y permanece vigente por 3 años después de la terminación del contrato.</p>
                <p>El Consultor no divulgará información del negocio del Cliente a terceros sin autorización expresa.</p>
              </Clause>

              <Clause num="7" title="USO DE INTELIGENCIA ARTIFICIAL">
                <p>El Cliente acepta que el Consultor utiliza herramientas de inteligencia artificial en la producción de entregables. Los resultados son revisados y validados por el Consultor antes de su entrega. El Consultor es responsable de la calidad final de los entregables, independientemente de las herramientas utilizadas en su producción.</p>
              </Clause>

              <Clause num="8" title="LIMITACIÓN DE RESPONSABILIDAD">
                <p>La responsabilidad del Consultor se limita al monto total pagado por el Cliente en el proyecto específico. El Consultor no será responsable por daños indirectos, pérdida de ingresos o lucro cesante derivados del uso de los entregables.</p>
                <p>El Cliente es responsable de validar que los entregables cumplen sus requisitos específicos antes de ponerlos en producción.</p>
              </Clause>

              <Clause num="9" title="TERMINACIÓN">
                <p>Cualquiera de las partes puede terminar el contrato con 5 días de aviso por escrito. Si la terminación ocurre durante la Fase 2 por causa imputable al Cliente, el pago ya realizado no es reembolsable. Si es imputable al Consultor, se reembolsará el avance no entregado.</p>
              </Clause>

              <Clause num="10" title="LEY APLICABLE Y JURISDICCIÓN">
                <p>Este contrato se rige por las leyes de los Estados Unidos Mexicanos. Ante cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes de [ciudad], México, renunciando a cualquier otro fuero que pudiera corresponderles.</p>
              </Clause>

              <Firma fecha={fecha} />
            </Legal>
          </DocSection>
        )}

        {/* ── NDA ── */}
        {active === 'NDA' && (
          <DocSection title="Acuerdo de Confidencialidad" subtitle="Non-Disclosure Agreement (NDA)" badge="Mutuo · México" fecha={fecha}>
            <Legal>
              <Clause num="1" title="PARTES">
                <p><strong>PARTE A:</strong> [Tu nombre o razón social] — El Consultor</p>
                <p><strong>PARTE B:</strong> [Nombre del cliente / empresa] — El Cliente</p>
                <p>En conjunto denominadas "Las Partes".</p>
              </Clause>

              <Clause num="2" title="PROPÓSITO">
                <p>Las Partes desean intercambiar información confidencial con el propósito de evaluar y ejecutar una relación comercial de consultoría tecnológica. El presente acuerdo establece las condiciones bajo las cuales dicha información puede ser compartida y utilizada.</p>
              </Clause>

              <Clause num="3" title="DEFINICIÓN DE INFORMACIÓN CONFIDENCIAL">
                <p>Se considera información confidencial toda aquella que una Parte designe como tal, o que por su naturaleza deba entenderse como confidencial, incluyendo pero no limitándose a:</p>
                <ul>
                  <li>Información financiera, operativa y comercial del negocio</li>
                  <li>Estrategias, planes de negocio y datos de clientes</li>
                  <li>Código fuente, arquitecturas tecnológicas y metodologías propias</li>
                  <li>El sistema Raziel, su configuración y funcionamiento interno</li>
                  <li>Cualquier información marcada como "confidencial" o "restringida"</li>
                </ul>
              </Clause>

              <Clause num="4" title="OBLIGACIONES DE CONFIDENCIALIDAD">
                <p>Cada Parte se obliga a: (a) mantener estricta confidencialidad sobre la información recibida; (b) usar la información exclusivamente para el propósito definido en este acuerdo; (c) no divulgar la información a terceros sin autorización escrita previa; (d) proteger la información con el mismo nivel de cuidado que aplica a su propia información confidencial, no menor a diligencia razonable.</p>
              </Clause>

              <Clause num="5" title="EXCEPCIONES">
                <p>Las obligaciones de confidencialidad no aplican a información que: (a) sea o se vuelva pública sin acto u omisión de quien la recibió; (b) fuera conocida previamente por quien la recibe; (c) sea recibida legítimamente de terceros sin restricción de confidencialidad; (d) deba divulgarse por mandato legal o resolución judicial, previo aviso a la otra Parte.</p>
              </Clause>

              <Clause num="6" title="VIGENCIA">
                <p>Este acuerdo tiene vigencia de 3 (tres) años a partir de su firma, o por el período de la relación comercial más 2 años adicionales, lo que resulte mayor. Las obligaciones sobre secretos industriales son indefinidas.</p>
              </Clause>

              <Clause num="7" title="CONSECUENCIAS DEL INCUMPLIMIENTO">
                <p>El incumplimiento de este acuerdo dará derecho a la Parte afectada a exigir el cese inmediato de la divulgación, indemnización por los daños y perjuicios causados, y cualquier otro remedio disponible conforme a la legislación mexicana aplicable.</p>
              </Clause>

              <Clause num="8" title="LEY APLICABLE">
                <p>Este acuerdo se rige por la Ley Federal de Protección al Secreto Industrial y demás legislación aplicable en México.</p>
              </Clause>

              <Firma fecha={fecha} />
            </Legal>
          </DocSection>
        )}

        {/* ── PRIVACIDAD ── */}
        {active === 'Privacidad' && (
          <DocSection title="Aviso de Privacidad" subtitle="Conforme a LFPDPPP · México" badge="LFPDPPP 2026" fecha={fecha}>
            <Legal>
              <p className="text-sm text-[#94a3b8] print:text-gray-600 mb-6">
                En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento, [Tu nombre o razón social], en adelante "El Responsable", pone a su disposición el presente Aviso de Privacidad.
              </p>

              <Clause num="1" title="IDENTIDAD Y DOMICILIO DEL RESPONSABLE">
                <p>[Tu nombre o razón social]</p>
                <p>Domicilio: [Tu domicilio en México]</p>
                <p>Correo electrónico: [Tu correo de contacto]</p>
              </Clause>

              <Clause num="2" title="DATOS PERSONALES QUE SE RECABAN">
                <p>El Responsable recaba los siguientes datos personales de sus clientes:</p>
                <ul>
                  <li><strong>Identificación:</strong> nombre, cargo, empresa, RFC</li>
                  <li><strong>Contacto:</strong> correo electrónico, teléfono, domicilio</li>
                  <li><strong>Operativos:</strong> información del negocio, procesos, métricas financieras compartidas voluntariamente para la prestación del servicio</li>
                </ul>
                <p>No se recaban datos sensibles (salud, biometría, origen racial, creencias religiosas, ideología política).</p>
              </Clause>

              <Clause num="3" title="FINALIDADES DEL TRATAMIENTO">
                <p><strong>Finalidades primarias (necesarias para el servicio):</strong></p>
                <ul>
                  <li>Prestación del servicio de consultoría contratado</li>
                  <li>Emisión de facturas y gestión de cobros</li>
                  <li>Comunicación sobre el avance del proyecto</li>
                  <li>Cumplimiento de obligaciones contractuales y legales</li>
                </ul>
                <p><strong>Finalidades secundarias (puede oponerse):</strong></p>
                <ul>
                  <li>Envío de información sobre nuevos servicios o actualizaciones</li>
                  <li>Estudios internos de mejora del servicio (con datos anonimizados)</li>
                </ul>
              </Clause>

              <Clause num="4" title="USO DE INTELIGENCIA ARTIFICIAL">
                <p>El Responsable utiliza herramientas de inteligencia artificial en la producción de entregables. La información del Cliente puede ser procesada por sistemas de IA de terceros (incluyendo Anthropic, Inc.) exclusivamente para generar los entregables contratados. Estos sistemas están sujetos a sus propias políticas de privacidad. El Responsable no permite que dichos sistemas entrenen sus modelos con datos del Cliente.</p>
              </Clause>

              <Clause num="5" title="TRANSFERENCIA DE DATOS">
                <p>El Responsable no transfiere datos personales a terceros, salvo: (a) a proveedores de servicios tecnológicos necesarios para operar (procesadores de datos); (b) cuando sea requerido por autoridad competente conforme a ley. En todo caso, se exige a dichos terceros el mismo nivel de protección establecido en este aviso.</p>
              </Clause>

              <Clause num="6" title="DERECHOS ARCO">
                <p>Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales (Derechos ARCO), así como a revocar su consentimiento. Para ejercerlos, envíe su solicitud a [correo electrónico] indicando: nombre completo, datos a ejercer, y copia de identificación oficial. El Responsable responderá en un plazo máximo de 20 días hábiles.</p>
              </Clause>

              <Clause num="7" title="CONSERVACIÓN DE DATOS">
                <p>Los datos se conservarán durante el plazo de la relación comercial y por 5 años adicionales para cumplimiento fiscal y legal, salvo que usted solicite su cancelación antes y no exista obligación legal de conservarlos.</p>
              </Clause>

              <Clause num="8" title="CAMBIOS AL AVISO">
                <p>Cualquier modificación a este Aviso será notificada por correo electrónico con 15 días de anticipación. La versión vigente siempre estará disponible en [tu sitio web o medio de comunicación habitual].</p>
              </Clause>

              <p className="text-xs text-[#64748b] print:text-gray-500 mt-6">Última actualización: {fecha}</p>
            </Legal>
          </DocSection>
        )}

        {/* ── TÉRMINOS ── */}
        {active === 'Términos' && (
          <DocSection title="Términos y Condiciones Generales" subtitle="Uso del servicio de consultoría" badge="B2B · México" fecha={fecha}>
            <Legal>
              <Clause num="1" title="ACEPTACIÓN">
                <p>Al contratar los servicios de consultoría de [Tu nombre o razón social], el Cliente acepta íntegramente los presentes Términos y Condiciones. Si el Cliente no está de acuerdo con alguno de ellos, no deberá contratar el servicio.</p>
              </Clause>

              <Clause num="2" title="DESCRIPCIÓN DEL SERVICIO">
                <p>El servicio consiste en consultoría comercial y desarrollo de soluciones SaaS a la medida, entregado en la modalidad descrita en la Propuesta de Proyecto correspondiente. Los entregables varían según el proyecto e incluyen: prototipos funcionales, estrategias comerciales, documentación técnica y legal, análisis financieros, y soluciones de software.</p>
              </Clause>

              <Clause num="3" title="OBLIGACIONES DEL CLIENTE">
                <p>Para la correcta prestación del servicio, el Cliente se obliga a:</p>
                <ul>
                  <li>Proporcionar información veraz, completa y oportuna sobre su negocio</li>
                  <li>Designar un interlocutor con capacidad de tomar decisiones</li>
                  <li>Revisar y aprobar o rechazar entregables en los plazos acordados</li>
                  <li>Realizar los pagos en los términos establecidos</li>
                  <li>No usar los entregables para fines ilegales o contrarios a la moral</li>
                </ul>
              </Clause>

              <Clause num="4" title="POLÍTICA DE REVISIONES">
                <p>Cada fase incluye hasta 2 rondas de revisiones sin costo adicional, basadas en los requisitos originales acordados. Cambios en el alcance original, adición de funcionalidades o modificaciones sustanciales al diseño inicial se cotizarán por separado.</p>
              </Clause>

              <Clause num="5" title="HERRAMIENTAS DE IA Y LIMITACIONES">
                <p>Los entregables son producidos con asistencia de inteligencia artificial supervisada por el Consultor. El Cliente entiende que: (a) la IA puede generar errores que el Consultor revisará y corregirá; (b) los entregables deben ser validados por el Cliente antes de su implementación en producción; (c) el Consultor no garantiza que los entregables sean perfectos ni libres de errores post-entrega.</p>
              </Clause>

              <Clause num="6" title="DISPONIBILIDAD Y SOPORTE">
                <p>El Consultor no ofrece SLA (Service Level Agreement) formal de disponibilidad. El soporte durante el engagement está incluido. El soporte post-entrega, mantenimiento y actualizaciones futuras tienen un costo adicional que se acuerda por separado.</p>
              </Clause>

              <Clause num="7" title="CANCELACIONES Y REEMBOLSOS">
                <p>La Fase 1 (MVP) es gratuita y puede cancelarse sin penalización. La Fase 2 puede cancelarse antes de iniciar sin costo. Una vez iniciada la Fase 2, el anticipo del 50% no es reembolsable. Si el incumplimiento es imputable al Consultor, se reembolsará el proporcional no entregado.</p>
              </Clause>

              <Clause num="8" title="MODIFICACIONES A LOS TÉRMINOS">
                <p>El Consultor puede modificar estos Términos con 15 días de aviso previo. Los contratos en curso se rigen por los Términos vigentes al momento de su firma.</p>
              </Clause>

              <Clause num="9" title="DISPOSICIONES FINALES">
                <p>Si alguna cláusula de estos Términos resulta inválida o inaplicable, las demás permanecerán vigentes. Estos Términos, junto con la Propuesta de Proyecto y el Contrato de Prestación de Servicios, constituyen el acuerdo completo entre las partes.</p>
              </Clause>

              <p className="text-xs text-[#64748b] print:text-gray-500 mt-6">{año} · [Tu nombre o razón social] · Todos los derechos reservados</p>
            </Legal>
          </DocSection>
        )}

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

function DocSection({ title, subtitle, badge, fecha, children }: {
  title: string; subtitle: string; badge: string; fecha: string; children: React.ReactNode
}) {
  return (
    <>
      <div className="mb-8 pb-6 border-b border-[#1a2744] print:border-gray-300">
        <div className="flex items-center gap-3 mb-4 print:hidden">
          <div className="w-2 h-2 rounded-full bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
          <span className="text-xs text-[#64748b] tracking-widest uppercase">Raziel — Documentación Legal</span>
        </div>
        <h1 className="text-2xl font-bold text-white print:text-black mb-1">{title}</h1>
        <p className="text-[#64748b] print:text-gray-500 text-sm">{subtitle} · {fecha}</p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] print:bg-gray-100 print:border-gray-300">
          <span className="text-[#00d4ff] print:text-gray-700 text-xs font-semibold tracking-wide">{badge}</span>
        </div>
      </div>
      {children}
    </>
  )
}

function Legal({ children }: { children: React.ReactNode }) {
  return <div className="space-y-0">{children}</div>
}

function Clause({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-[#00d4ff] print:text-blue-700 uppercase tracking-wider mb-2">
        {num}. {title}
      </h3>
      <div className="space-y-2 text-sm text-[#cbd5e1] print:text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-[#e2e8f0] print:[&_strong]:text-black">
        {children}
      </div>
    </div>
  )
}

function Firma({ fecha }: { fecha: string }) {
  return (
    <div className="mt-10 pt-6 border-t border-[#1a2744] print:border-gray-300 grid grid-cols-2 gap-8">
      {['El Consultor', 'El Cliente'].map((parte) => (
        <div key={parte}>
          <div className="h-12 border-b border-[#1a2744] print:border-gray-400 mb-2" />
          <p className="text-xs text-[#64748b] print:text-gray-500">{parte}</p>
          <p className="text-xs text-[#475569] print:text-gray-400 mt-0.5">Nombre, firma y fecha</p>
          <p className="text-xs text-[#475569] print:text-gray-400">{fecha}</p>
        </div>
      ))}
    </div>
  )
}
