import React, { useState } from 'react';
import { UserCheck, Edit3, Trash2, ShieldAlert, Send } from 'lucide-react';
import { getTenantBranding } from '@/shared/lib/tenant-branding';

interface Props {
  tenantId?: string;
}

export function ArcoSection({ tenantId }: Props) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const branding = getTenantBranding(tenantId);

  const handleRightSelect = (label: string) => {
    setSubject(`Ejercicio de Derecho ARCO: ${label}`);
    // Scroll to input
    const input = document.getElementById('arco-email-input');
    input?.focus();
  };

  return (
    <div className="premium-card max-w-2xl mx-auto" style={{ borderTop: `4px solid ${branding.colors.primary}` }}>
      <div className="border-b border-white/5 pb-4 mb-6">
        <h3 className="text-xl font-black flex items-center gap-2 text-white uppercase tracking-tighter">
          <UserCheck style={{ color: branding.colors.primary }} /> Derechos ARCO
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Ejerce tus derechos de <span className="text-yellow-500 font-bold">Acceso, Rectificación, Cancelación u Oposición</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Acceder', icon: UserCheck, desc: 'Conoce qué datos tenemos' },
          { label: 'Rectificar', icon: Edit3, desc: 'Corrige info inexacta' },
          { label: 'Cancelar', icon: Trash2, desc: 'Elimina tu información' },
          { label: 'Oponerte', icon: ShieldAlert, desc: 'Limita el uso de datos' },
        ].map(item => (
          <button 
            key={item.label}
            onClick={() => handleRightSelect(item.label)}
            className={`p-4 bg-bg-dark border rounded-xl hover:border-brand-primary/50 transition-all text-left group ${
              subject.includes(item.label) ? 'border-brand-primary bg-brand-primary/5' : 'border-border-subtle'
            }`}
          >
            <item.icon style={{ color: branding.colors.primary }} className="mb-2 group-hover:scale-110 transition-transform" size={24} />
            <div className="font-bold text-white uppercase tracking-tight text-sm">{item.label}</div>
            <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">{item.desc}</div>
          </button>
        ))}
      </div>

      <div className="p-6 rounded-xl border bg-white/5 border-white/10">
        <label htmlFor="arco-email-input" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
          {subject || 'Solicitar vía Email Oficial'}
        </label>
        <div className="flex gap-2">
          <input 
            id="arco-email-input"
            type="email" 
            placeholder="tu@email.com"
            className="flex-1 bg-bg-dark border border-border-subtle p-3 rounded-lg focus:outline-none focus:border-brand-primary transition-colors text-white font-mono text-sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button 
            onClick={() => {
              if (!email) return;
              // Open mailto with ARCO request
              const arcoEmail = branding.email || 'arco@tu-empresa.com';
              const body = `Solicitud de ejercicio de Derechos ARCO%0A%0ATipo: ${subject || 'General'}%0AEmail del solicitante: ${email}%0A%0ASolicito ejercer mi derecho conforme al Art. 28 de la LFPDPPP.`;
              window.open(`mailto:${arcoEmail}?subject=${encodeURIComponent(subject || 'Ejercicio de Derechos ARCO')}&body=${body}`, '_blank');
              setSubmitted(true);
            }}
            className="btn-primary !py-2 !px-6"
          >
            <Send size={18} /> Enviar
          </button>
        </div>
        {submitted && (
          <p className="text-[10px] mt-4 font-black uppercase tracking-widest animate-pulse text-brand-primary">
            ✓ Solicitud Recibida. Responderemos en <span className="text-yellow-500">20 días hábiles</span>.
          </p>
        )}
      </div>
    </div>
  );
}
