'use client';

import { ShieldCheck, UserCheck, Trash2, Edit3, Eye } from 'lucide-react';
import { getTenantBranding } from '@/shared/lib/tenant-branding';

export function ArcoExplanation() {
  const branding = getTenantBranding();
  const rights = [
    {
      id: 'A',
      title: 'Acceso',
      icon: Eye,
      description: 'Derecho a conocer qué datos personales tenemos, para qué se utilizan y las condiciones del uso que les damos.'
    },
    {
      id: 'R',
      title: 'Rectificación',
      icon: Edit3,
      description: 'Derecho a solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta.'
    },
    {
      id: 'C',
      title: 'Cancelación',
      icon: Trash2,
      description: 'Derecho a que la información sea eliminada de nuestros registros o bases de datos cuando considere que no está siendo utilizada conforme a los principios, deberes y obligaciones.'
    },
    {
      id: 'O',
      title: 'Oposición',
      icon: UserCheck,
      description: 'Derecho a oponerse al uso de sus datos personales para fines específicos.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white flex justify-center items-center gap-3">
          <ShieldCheck className="text-brand-primary" size={32} /> Derechos ARCO
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          En México, la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) 
          garantiza a los titulares de la información el control sobre sus datos a través de estos cuatro derechos fundamentales.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rights.map((right) => (
          <div key={right.id} className="premium-card hover:border-brand-primary transition-colors group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary font-black text-2xl w-14 h-14 flex items-center justify-center border border-brand-primary/20 group-hover:scale-110 transition-transform">
                {right.id}
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">{right.title}</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {right.description.split(' ').map((word, idx) => {
                const highlights = ['conocer', 'corrección', 'eliminada', 'oponerse', 'fines', 'específicos'];
                const cleanWord = word.toLowerCase().replace(/[.,]/g, '');
                if (highlights.includes(cleanWord)) {
                  return <span key={idx} className="text-yellow-500 font-bold">{word} </span>;
                }
                return word + ' ';
              })}
            </p>
          </div>
        ))}
      </div>

      <div className="premium-card bg-bg-dark border-dashed border-gray-800">
        <h4 className="font-black text-white mb-4 uppercase tracking-widest text-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
          Cómo ejercerlos en este SaaS
        </h4>
        <p className="text-sm text-gray-400 mb-6">
          Para ejercer cualquiera de los derechos ARCO, el titular deberá presentar la solicitud respectiva a través de:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-xl border border-border-subtle group hover:border-brand-primary transition-colors">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Correo Electrónico Oficial</p>
            <p className="text-brand-primary font-bold">{branding.email || 'arco@tu-empresa.com'}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-border-subtle group hover:border-brand-primary transition-colors">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Tiempo de Respuesta Legal</p>
            <p className="text-white font-bold"><span className="text-yellow-500 font-black">20 días hábiles</span> (según LFPDPPP)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
