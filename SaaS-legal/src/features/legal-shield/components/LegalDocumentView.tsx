'use client';

import { FileText, ShieldCheck, Scale } from 'lucide-react';
import { getTenantBranding } from '@/shared/lib/tenant-branding';

interface Props {
  type: 'privacy' | 'terms';
}

export function LegalDocumentView({ type }: Props) {
  const isPrivacy = type === 'privacy';
  const branding = getTenantBranding();
  const today = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  
  return (
    <div className="max-w-4xl mx-auto premium-card bg-bg-card text-white p-6 sm:p-12 overflow-hidden">
      <div className="flex items-center gap-3 mb-8 border-b pb-6 border-white/5">
        {isPrivacy ? <ShieldCheck className="text-brand-primary" size={32} /> : <Scale className="text-brand-primary" size={32} />}
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">
          {isPrivacy ? 'Aviso de Privacidad Integral' : 'Términos y Condiciones de Uso'}
        </h2>
      </div>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300 leading-relaxed">
        <p className="font-bold text-yellow-500 uppercase tracking-widest text-[10px]">Última actualización: {today}</p>
        
        {isPrivacy ? (
          <>
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase mb-2 border-l-4 border-brand-primary pl-4">1. Identidad y Domicilio del Responsable</h3>
              <p>
                <span className="text-white font-bold">{branding.name}</span>, con domicilio en <span className="text-yellow-500">Tuxtla Gutiérrez, Chiapas, México</span>, 
                es el responsable del tratamiento de sus datos personales conforme a la <span className="text-brand-primary font-bold">LFPDPPP</span>.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase mb-2 border-l-4 border-brand-primary pl-4">2. Datos Personales Recabados</h3>
              <p>
                Recabamos datos de <span className="text-yellow-500">identificación</span>, contacto y, en su caso, 
                <span className="text-yellow-500">datos fiscales y financieros</span> exclusivamente para la prestación de nuestros servicios 
                de asesoría legal automatizada.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase mb-2 border-l-4 border-brand-primary pl-4">3. Finalidades del Tratamiento</h3>
              <ul className="space-y-3">
                <li className="flex gap-3"><span className="text-brand-primary font-bold">●</span> Proveer los <span className="text-yellow-500">servicios de diagnóstico legal</span>.</li>
                <li className="flex gap-3"><span className="text-brand-primary font-bold">●</span> Generar <span className="text-yellow-500">borradores de contratos</span> personalizados.</li>
                <li className="flex gap-3"><span className="text-brand-primary font-bold">●</span> Atender solicitudes de soporte técnico.</li>
                <li className="flex gap-3"><span className="text-brand-primary font-bold">●</span> Cumplir con <span className="text-yellow-500">obligaciones legales</span> ante autoridades.</li>
              </ul>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase mb-2 border-l-4 border-brand-primary pl-4">4. Transferencia de Datos</h3>
              <p>
                Le informamos que sus datos personales <span className="text-yellow-500 font-bold underline decoration-brand-primary underline-offset-4">NO son compartidos con terceros</span>, 
                salvo por requerimiento de autoridad competente o para el procesamiento de pagos.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase mb-2 border-l-4 border-brand-primary pl-4">1. Aceptación de los Términos</h3>
              <p>
                Al acceder a nuestro SaaS, usted <span className="text-yellow-500 font-bold italic">acepta íntegramente</span> estos términos. 
                Si no de acuerdo, por favor <span className="text-brand-primary font-bold">absténgase de usar</span> la plataforma.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase mb-2 border-l-4 border-brand-primary pl-4">2. Licencia de Uso</h3>
              <p>
                Otorgamos una licencia <span className="text-yellow-500">limitada, no exclusiva e intransferible</span> para el uso de nuestras herramientas legales. 
                Queda <span className="text-red-500 font-bold uppercase tracking-tighter">estrictamente prohibida</span> la ingeniería inversa del código fuente.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase mb-2 border-l-4 border-brand-primary pl-4">3. Limitación de Responsabilidad</h3>
              <p>
                Nuestra plataforma proporciona <span className="text-yellow-500">"orientación automatizada"</span>. 
                <span className="text-white font-bold">No sustituye el consejo legal</span> de un abogado colegiado. 
                El uso de la información es responsabilidad exclusiva del usuario.
              </p>
            </section>
            <section className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase mb-2 border-l-4 border-brand-primary pl-4">4. Pagos y Cancelaciones</h3>
              <p>
                Las suscripciones se renuevan <span className="text-yellow-500">automáticamente</span> a menos que se cancelen con 
                <span className="text-brand-primary font-bold"> 5 días de anticipación </span> al corte.
              </p>
            </section>
          </>
        )}
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase">
        <p>Copyright © {new Date().getFullYear()} {branding.name}</p>
        <button className="flex items-center gap-2 hover:text-brand-primary transition-colors bg-white/5 py-2 px-4 rounded-lg border border-white/10" onClick={() => window.print()}>
          <FileText size={14} /> Imprimir copia
        </button>
      </div>
    </div>
  );
}
