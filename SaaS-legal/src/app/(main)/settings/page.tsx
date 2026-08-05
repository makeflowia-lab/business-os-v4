'use client';

import { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Save, LogOut, Check, Loader2, Trash2 } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { deleteAssessment, getAssessments, updateUserProfile } from '@/features/legal-shield/actions';

type SettingsTab = 'perfil' | 'notificaciones' | 'seguridad' | 'datos';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>('perfil');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [name, setName] = useState(session?.user?.name || '');
  const [timezone, setTimezone] = useState('mx');

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateUserProfile({ name });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(res.error || 'Error al guardar el perfil');
      }
    } catch (error) {
      console.error('Save profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllAssessments = async () => {
    if (!confirm('¿Estás seguro? Esta acción eliminará TODOS tus análisis y no se puede deshacer.')) return;
    setDeleting(true);
    try {
      const res = await getAssessments();
      if (res.success && res.data) {
        for (const assessment of res.data) {
          await deleteAssessment(assessment.id);
        }
      }
      setDeleted(true);
      setTimeout(() => setDeleted(false), 3000);
    } catch (error) {
      console.error('Error deleting assessments:', error);
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { id: 'perfil' as SettingsTab, label: 'Perfil', icon: User },
    { id: 'notificaciones' as SettingsTab, label: 'Notificaciones', icon: Bell },
    { id: 'seguridad' as SettingsTab, label: 'Seguridad', icon: Shield },
    { id: 'datos' as SettingsTab, label: 'Datos & Logs', icon: Database },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-8 px-4">
      <header>
        <h1 className="text-[var(--text-2xl)] font-black text-white tracking-tight flex items-center gap-3">
          <Settings className="text-brand-primary" size={32} /> Configuración del Sistema
        </h1>
        <p className="text-gray-500 font-medium">Gestiona tu cuenta, preferencias y seguridad del blindaje.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Settings Navigation */}
        <aside className="space-y-2">
          {tabs.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                activeTab === item.id ? 'bg-brand-primary text-black' : 'text-gray-500 hover:bg-white/5'
              }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all mt-8"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </aside>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === 'perfil' && (
            <div className="premium-card p-8">
              <h3 className="text-white font-black uppercase tracking-wider mb-6 pb-4 border-b border-border-subtle">
                Información de la Cuenta
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nombre Público</label>
                  <input 
                    type="text" 
                    title="Nombre público" 
                    className="premium-input" 
                    value={name || session?.user?.name || ''} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    title="Correo electrónico" 
                    className="premium-input opacity-60" 
                    value={session?.user?.email || ''} 
                    disabled 
                    placeholder="tu@email.com" 
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Zona Horaria</label>
                  <select 
                    title="Zona horaria" 
                    className="premium-input bg-bg-card outline-none appearance-none" 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="mx">Ciudad de México (GMT-6)</option>
                    <option value="gd">Guadalajara (GMT-6)</option>
                    <option value="mty">Monterrey (GMT-6)</option>
                    <option value="tj">Tijuana (GMT-8)</option>
                    <option value="bog">Bogotá (GMT-5)</option>
                    <option value="ny">New York (GMT-5)</option>
                    <option value="mad">Madrid (GMT+1)</option>
                  </select>
                </div>
              </div>
              
              <button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary mt-10 w-full sm:w-auto disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <Check size={18} /> : <Save size={18} />}
                {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar Cambios'}
              </button>
            </div>
          )}

          {activeTab === 'notificaciones' && (
            <div className="premium-card p-8">
              <h3 className="text-white font-black uppercase tracking-wider mb-6 pb-4 border-b border-border-subtle">
                Preferencias de Notificación
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Alertas de riesgo legal', desc: 'Notificaciones cuando un análisis detecta riesgo ALTO', default: true },
                  { label: 'Contratos por vencer', desc: 'Recordatorio 30 días antes del vencimiento', default: true },
                  { label: 'Actualizaciones del sistema', desc: 'Nuevas funcionalidades y mejoras', default: false },
                ].map((item, i) => (
                  <label key={i} className="flex items-center justify-between p-4 bg-bg-dark border border-border-subtle rounded-xl hover:border-brand-primary/30 transition-all cursor-pointer">
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked={item.default} className="w-5 h-5 accent-[var(--brand-primary)]" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="premium-card p-8">
              <h3 className="text-white font-black uppercase tracking-wider mb-6 pb-4 border-b border-border-subtle">
                Seguridad de la Cuenta
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-sm font-bold text-green-500">Autenticación: Magic Link (Email)</p>
                  <p className="text-xs text-gray-400 mt-1">Tu cuenta usa enlaces mágicos por email. No se almacenan contraseñas.</p>
                </div>
                <div className="p-4 bg-bg-dark border border-border-subtle rounded-xl">
                  <p className="text-sm font-bold text-white">Sesiones activas</p>
                  <p className="text-xs text-gray-400 mt-1">Sesión actual: {session?.user?.email || 'No identificado'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'datos' && (
            <div className="space-y-6">
              <div className="premium-card p-8">
                <h3 className="text-white font-black uppercase tracking-wider mb-6 pb-4 border-b border-border-subtle">
                  Datos y Almacenamiento
                </h3>
                <p className="text-sm text-gray-400">Tus datos están almacenados de forma segura en servidores con cifrado AES-256.</p>
              </div>
              <div className="premium-card p-8 border-red-500/20 bg-red-500/5">
                <h3 className="text-red-500 font-black uppercase tracking-wider mb-2">Zona de Peligro</h3>
                <p className="text-gray-500 text-xs mb-6">Acciones que no se pueden deshacer. Procede con extrema precaución.</p>
                <button 
                  onClick={handleDeleteAllAssessments}
                  disabled={deleting}
                  className="px-6 py-3 border border-red-500/30 text-red-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : deleted ? <Check size={16} /> : <Trash2 size={16} />}
                  {deleting ? 'Eliminando...' : deleted ? 'Eliminados' : 'Eliminar Todos los Análisis'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
