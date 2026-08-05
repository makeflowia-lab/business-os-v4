import React, { useState } from 'react';
import { Shield, X, Settings } from 'lucide-react';
import { getTenantBranding } from '@/shared/lib/tenant-branding';

interface Props {
  dataType?: 'personales' | 'sensibles';
  industry?: string;
  riskLevel?: 'high' | 'medium' | 'low';
  tenantId?: string;
}

export function ConsentBanner({ dataType = 'personales', industry = 'SaaS', riskLevel = 'medium', tenantId }: Props) {
  const [visible, setVisible] = useState(true);
  const branding = getTenantBranding(tenantId);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="max-w-4xl mx-auto bg-bg-card border border-brand-primary/30 p-6 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center gap-6" style={{ borderLeft: `4px solid ${branding.colors.primary}` }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${branding.colors.primary}1A` }}>
          <Shield style={{ color: branding.colors.primary }} size={24} />
        </div>
        
        <div className="flex-1">
          <h4 className="text-white font-semibold flex items-center gap-2">
            Tus datos están protegidos <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded uppercase">Cumplimiento 2026</span>
          </h4>
          <p className="text-gray-400 text-sm mt-1">
            Utilizamos tus datos <span className="text-white font-medium">{dataType}</span> para mejorar tu experiencia en la plataforma de <span className="text-white font-medium">{industry}</span>. 
            Al aceptar, autorizas el tratamiento conforme a nuestro Aviso de Privacidad Integral.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setVisible(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400"
            title="Configurar preferencias"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={() => setVisible(false)}
            className="px-6 py-2 rounded-lg text-white font-bold transition-all"
            style={{ backgroundColor: branding.colors.primary }}
          >
            Aceptar y continuar
          </button>
        </div>
      </div>
    </div>
  );
}
