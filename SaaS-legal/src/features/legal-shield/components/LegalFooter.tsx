import React from 'react';
import { getTenantBranding } from '@/shared/lib/tenant-branding';

interface Props {
  tenantId?: string;
  disclaimer?: string;
  onNavigate?: (view: string) => void;
}

export function LegalFooter({ tenantId, disclaimer, onNavigate }: Props) {
  const branding = getTenantBranding(tenantId);
  const defaultDisclaimer = 'No somos abogados. Esto es orientación automatizada basada en normativa pública mexicana 2026.';

  return (
    <footer className="border-t border-border-subtle p-10 text-center text-gray-500 text-sm" style={{ backgroundColor: branding.colors.background }}>
      <p className="mb-4 text-xs font-bold text-gray-400">
        ⚠️ AVISO LEGAL: {disclaimer || defaultDisclaimer}
      </p>
      <div className="flex justify-center gap-6 mb-4">
        <button onClick={() => onNavigate?.('privacy')} className="hover:text-brand-primary">Aviso de Privacidad</button>
        <button onClick={() => onNavigate?.('terms')} className="hover:text-brand-primary">Términos de Servicio</button>
        <button onClick={() => onNavigate?.('arco')} className="hover:text-brand-primary">Derechos ARCO</button>
      </div>
      <p>&copy; 2026 {branding.name} (MR). Todos los derechos reservados.</p>
      {branding.email && (
        <p className="mt-1">
          Contacto: <a href={`mailto:${branding.email}`} className="text-brand-primary hover:underline">{branding.email}</a>
        </p>
      )}
      <p className="mt-2 text-[10px] uppercase tracking-widest text-brand-primary/50">
        Powered by Legal Shield White-Label
      </p>
    </footer>
  );
}
