'use client';

import { useState } from 'react';
import { Settings, Save, Check, Loader2 } from 'lucide-react';
import { defaultBranding } from '@/shared/lib/tenant-branding';
import { updateTenantBranding, getTenantBranding as getBrandingAction } from '@/features/legal-shield/actions';
import { useEffect } from 'react';

export function ConfigPanel() {
  const [branding, setBranding] = useState(defaultBranding);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBranding = async () => {
      const result = await getBrandingAction();
      if (result.success && result.data) {
        setBranding(result.data);
      }
    };
    fetchBranding();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = await updateTenantBranding({
        name: branding.name,
        email: branding.email,
        colors: branding.colors,
      });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error || 'Error al guardar');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto premium-card">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="text-brand-primary" /> Configuración de la Fábrica (Tenant)
      </h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="saas-name" className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del SaaS</label>
            <input 
              id="saas-name"
              type="text" 
              className="w-full bg-bg-dark border border-border-subtle p-3 rounded-lg text-white"
              value={branding.name}
              onChange={e => setBranding({...branding, name: e.target.value})}
            />
          </div>
          <div>
            <label htmlFor="legal-email" className="block text-xs font-bold text-gray-500 uppercase mb-1">Email de Soporte / Legal</label>
            <input 
              id="legal-email"
              type="email" 
              className="w-full bg-bg-dark border border-border-subtle p-3 rounded-lg text-white font-mono"
              value={branding.email}
              onChange={e => setBranding({...branding, email: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="primary-color" className="block text-xs font-bold text-gray-500 uppercase mb-1">Color Primario</label>
                <div className="flex gap-2">
                  <input 
                    id="primary-color"
                    type="color" 
                    className="h-10 w-10 bg-transparent border-none"
                    value={branding.colors.primary}
                    onChange={e => setBranding({...branding, colors: {...branding.colors, primary: e.target.value}})}
                  />
                  <input 
                    aria-label="Código Hex Color Primario"
                    type="text" 
                    className="flex-1 bg-bg-dark border border-border-subtle p-2 rounded-lg text-white font-mono text-center"
                    value={branding.colors.primary}
                    onChange={e => setBranding({...branding, colors: {...branding.colors, primary: e.target.value}})}
                  />
                </div>
             </div>
             <div>
                <label htmlFor="bg-color" className="block text-xs font-bold text-gray-500 uppercase mb-1">Color Fondo</label>
                <div className="flex gap-2">
                  <input 
                    id="bg-color"
                    type="color" 
                    className="h-10 w-10 bg-transparent border-none"
                    value={branding.colors.background}
                    onChange={e => setBranding({...branding, colors: {...branding.colors, background: e.target.value}})}
                  />
                  <input 
                    aria-label="Código Hex Color Fondo"
                    type="text" 
                    className="flex-1 bg-bg-dark border border-border-subtle p-2 rounded-lg text-white font-mono text-center"
                    value={branding.colors.background}
                    onChange={e => setBranding({...branding, colors: {...branding.colors, background: e.target.value}})}
                  />
                </div>
             </div>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button 
          type="submit" 
          disabled={saving}
          className="w-full btn-primary h-12 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" /> : saved ? <Check /> : <Save />}
          {saving ? 'Guardando...' : saved ? 'Cambios Guardados' : 'Guardar Configuración'}
        </button>
      </form>
    </div>
  );
}
