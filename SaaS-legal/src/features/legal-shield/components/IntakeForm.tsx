'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Database, Activity, Package, Globe, Users, Code, Building, CreditCard, HeartPulse } from 'lucide-react';

interface Props {
  onSubmit: (data: any) => void;
}

const industries = ['Salud / HealthTech', 'Transporte / Logística', 'Educación / EdTech', 'Legal / LegalTech', 'SaaS / Software Business', 'Finanzas y Pagos / FinTech', 'E-commerce', 'Otro'];

export function IntakeForm({ onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Bloque A: Datos del Proveedor
    providerLegalName: '',
    providerTaxId: '',
    providerAddress: '',
    providerRepresentative: '',
    providerEmail: '',
    providerPhone: '',

    // Bloque B: Datos del Cliente
    clientLegalName: '',
    clientTaxId: '',
    clientAddress: '',
    clientRepresentative: '',
    clientEmail: '',

    // Bloque C: Información del SaaS
    productName: '',
    industry: '',
    serviceDescription: '',
    modulesIncluded: '',
    jurisdiction: 'México',
    
    // Bloque D: Flags y Riesgo
    personalData: false,
    sensibleData: false,
    criticality: 'Bajo',
    hasSLA: false,
    hasElectronicBilling: false,
    businessModel: 'suscripción',
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinish = () => {
    onSubmit(formData);
  };

  const steps = [
    { title: 'Proveedor', icon: Building },
    { title: 'Cliente', icon: Users },
    { title: 'SaaS', icon: Package },
    { title: 'Blindaje', icon: Shield },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto premium-card mt-0 sm:mt-1 !p-2 lg:!p-3 shadow-2xl border-brand-primary/20 bg-bg-dark/80 backdrop-blur-xl transition-all duration-300">
      {/* Progress Stepper - Ultra-Compressed */}
      <div className="flex justify-between mb-3 sm:mb-4 relative px-2 sm:px-4 mt-1">
        <div className="absolute top-3 left-0 w-full h-0.5 bg-border-subtle z-0" />
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i + 1 <= step;
          return (
            <div key={s.title} className="relative z-10 flex flex-col items-center gap-1.5">
              <div 
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive ? 'bg-brand-primary text-black scale-110 shadow-[0_0_10px_rgba(0,102,255,0.4)]' : 'bg-bg-dark border border-border-subtle text-gray-500'
                }`}
              >
                <Icon size={14} className="sm:w-3.5" />
              </div>
              <span className={`hidden sm:block text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-brand-primary' : 'text-gray-500'}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-2 sm:space-y-3"
          >
            <div className="text-center mb-2 sm:mb-4">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tighter">Identidad del Proveedor</h2>
              <p className="text-gray-400 text-[8px] sm:text-[9px] italic leading-tight">Define legalmente quién otorga el servicio SaaS.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1">
                <label htmlFor="providerLegalName" className="text-[9px] font-bold text-gray-500 uppercase ml-1">Razón Social</label>
                <input 
                  id="providerLegalName"
                  type="text"
                  placeholder="Ej. Tecnología Global S.A. de C.V."
                  className="premium-input w-full !py-1 text-[11px]"
                  value={formData.providerLegalName}
                  onChange={e => setFormData({...formData, providerLegalName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="providerTaxId" className="text-[9px] font-bold text-gray-500 uppercase ml-1">RFC / Tax ID</label>
                <input 
                  id="providerTaxId"
                  type="text"
                  placeholder="RFC123456XYZ"
                  className="premium-input w-full font-mono uppercase !py-1 text-[11px]"
                  value={formData.providerTaxId}
                  onChange={e => setFormData({...formData, providerTaxId: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="providerAddress" className="text-[9px] font-bold text-gray-500 uppercase ml-1">Domicilio Fiscal Completo</label>
              <input 
                id="providerAddress"
                type="text"
                placeholder="Calle, Número, Colonia, CP, Ciudad..."
                className="premium-input w-full !py-1 text-[11px]"
                value={formData.providerAddress}
                onChange={e => setFormData({...formData, providerAddress: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label htmlFor="providerRepresentative" className="text-[9px] font-bold text-gray-500 uppercase ml-1">Representante Legal</label>
                <input 
                  id="providerRepresentative"
                  type="text"
                  placeholder="Nombre del apoderado"
                  className="premium-input w-full !py-1 text-[11px]"
                  value={formData.providerRepresentative}
                  onChange={e => setFormData({...formData, providerRepresentative: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="providerEmail" className="text-[9px] font-bold text-gray-500 uppercase ml-1">Correo Corporativo</label>
                <input 
                  id="providerEmail"
                  type="email"
                  placeholder="legal@tusaas.com"
                  className="premium-input w-full !py-1 text-[11px]"
                  value={formData.providerEmail}
                  onChange={e => setFormData({...formData, providerEmail: e.target.value})}
                />
              </div>
            </div>

            <button 
              onClick={nextStep}
              disabled={!formData.providerLegalName || !formData.providerTaxId}
              className="w-full btn-primary !py-3 font-black text-[10px] tracking-widest uppercase mt-2 shadow-xl shadow-brand-primary/20"
            >
              Confirmar Identidad
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-2 sm:space-y-3"
          >
            <div className="text-center mb-2 sm:mb-4">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tighter">Datos del Cliente</h2>
              <p className="text-gray-400 text-[8px] sm:text-[9px] italic leading-tight">¿A quién va dirigido el blindaje legal?</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1">
                <label htmlFor="clientLegalName" className="text-[9px] font-bold text-gray-500 uppercase ml-1">Nombre o Razón Social</label>
                <input 
                  id="clientLegalName"
                  type="text"
                  placeholder="Nombre del cliente"
                  className="premium-input w-full !py-1 text-[11px]"
                  value={formData.clientLegalName}
                  onChange={e => setFormData({...formData, clientLegalName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="clientTaxId" className="text-[9px] font-bold text-gray-500 uppercase ml-1">RFC Cliente</label>
                <input 
                  id="clientTaxId"
                  type="text"
                  placeholder="RFC Cliente"
                  className="premium-input w-full font-mono uppercase !py-2 text-xs"
                  value={formData.clientTaxId}
                  onChange={e => setFormData({...formData, clientTaxId: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="clientAddress" className="text-[9px] font-bold text-gray-500 uppercase ml-1">Domicilio del Cliente</label>
              <input 
                id="clientAddress"
                type="text"
                placeholder="Domicilio completo del cliente"
                className="premium-input w-full !py-2 text-xs"
                value={formData.clientAddress}
                onChange={e => setFormData({...formData, clientAddress: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label htmlFor="clientRepresentative" className="text-[9px] font-bold text-gray-500 uppercase ml-1">Representante del Cliente</label>
                <input 
                  id="clientRepresentative"
                  type="text"
                  placeholder="Nombre del contacto principal"
                  className="premium-input w-full !py-1 text-[11px]"
                  value={formData.clientRepresentative}
                  onChange={e => setFormData({...formData, clientRepresentative: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="clientEmail" className="text-[9px] font-bold text-gray-500 uppercase ml-1">Correo de Contacto</label>
                <input 
                  id="clientEmail"
                  type="email"
                  placeholder="email@cliente.com"
                  className="premium-input w-full !py-1 text-[11px]"
                  value={formData.clientEmail}
                  onChange={e => setFormData({...formData, clientEmail: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
              <button onClick={prevStep} className="w-full sm:flex-1 py-2.5 border border-border-subtle rounded-xl text-[10px] uppercase font-black hover:bg-white/5 transition-all order-2 sm:order-1 tracking-widest">Regresar</button>
              <button 
                onClick={nextStep}
                disabled={!formData.clientLegalName}
                className="w-full sm:flex-[2] btn-primary py-2.5 order-1 sm:order-2 text-[10px] uppercase font-black tracking-widest shadow-xl shadow-brand-primary/20"
              >
                Vincular Cliente
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-2 sm:space-y-3"
          >
            <div className="text-center mb-2 sm:mb-4">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tighter">Especificaciones del SaaS</h2>
              <p className="text-gray-400 text-[8px] sm:text-[9px] italic leading-tight">Detalles técnicos que delimitan el alcance.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1">
                <label htmlFor="productName" className="text-[9px] font-bold text-gray-500 uppercase ml-1">Nombre Comercial</label>
                <input 
                  id="productName"
                  type="text"
                  placeholder="Ej. CloudDoc v3"
                  className="premium-input w-full !py-2 text-xs"
                  value={formData.productName}
                  onChange={e => setFormData({...formData, productName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="industry" className="text-[9px] font-bold text-gray-500 uppercase ml-1">Industria / Vertical</label>
                <select 
                  id="industry"
                  className="premium-input w-full !py-2 text-xs"
                  value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                  aria-label="Industria"
                >
                  <option value="">Selecciona industria</option>
                  {industries.map(i => <option key={i} value={i.toLowerCase()}>{i}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="serviceDescription" className="text-[9px] font-bold text-gray-500 uppercase ml-1">Descripción del Servicio</label>
              <textarea 
                id="serviceDescription"
                placeholder="Describe brevemente qué hace tu software..."
                className="premium-input w-full h-12 pt-1.5 text-[11px]"
                value={formData.serviceDescription}
                onChange={e => setFormData({...formData, serviceDescription: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="jurisdiction" className="text-[9px] font-bold text-gray-500 uppercase ml-1">País / Región</label>
              <select 
                id="jurisdiction"
                className="premium-input w-full bg-brand-primary/5 border-brand-primary/40 font-bold !py-1 text-[11px]"
                value={formData.jurisdiction}
                onChange={e => setFormData({...formData, jurisdiction: e.target.value})}
                aria-label="Jurisdicción"
              >
                <option value="México">México</option>
                <option value="USA">USA</option>
                <option value="España">España</option>
                <option value="Colombia">Colombia</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
              <button onClick={prevStep} className="w-full sm:flex-1 py-2.5 border border-border-subtle rounded-xl text-[10px] uppercase font-black hover:bg-white/5 transition-all order-2 sm:order-1 tracking-widest">Regresar</button>
              <button 
                onClick={nextStep}
                disabled={!formData.productName || !formData.industry}
                className="w-full sm:flex-[2] btn-primary py-2.5 order-1 sm:order-2 text-[10px] uppercase font-black tracking-widest shadow-xl shadow-brand-primary/20"
              >
                Configurar Alcance
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="text-center mb-2 sm:mb-4">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tighter">Blindaje y Criticalidad</h2>
              <p className="text-gray-400 text-[8px] sm:text-[9px] italic leading-tight">Activa las cláusulas de protección avanzada.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {[
                { id: 'personalData', label: 'Datos Personales', icon: Database, color: 'brand-primary' },
                { id: 'sensibleData', label: 'Datos Sensibles', icon: HeartPulse, color: 'red-500' },
                { id: 'hasSLA', label: 'Incluir SLA', icon: Activity, color: 'yellow-500' },
                { id: 'hasElectronicBilling', label: 'Facturación Elect.', icon: CreditCard, color: 'green-500' }
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = (formData as any)[opt.id];
                return (
                  <button 
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({...formData, [opt.id]: !isSelected})}
                    className={`p-2.5 sm:p-3 border rounded-xl flex items-center justify-between transition-all ${
                      isSelected ? `border-${opt.color} bg-${opt.color}/10` : 'border-border-subtle hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isSelected ? `text-${opt.color}` : 'text-gray-500'} />
                      <span className="text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-tight">{opt.label}</span>
                    </div>
                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${isSelected ? `bg-${opt.color} border-${opt.color}` : 'border-gray-600'}`} />
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Nivel de Responsabilidad / Riesgo</label>
              <div className="flex gap-2">
                {['Bajo', 'Medio', 'Alto'].map(r => (
                  <button
                    key={r}
                    onClick={() => setFormData({...formData, criticality: r as any})}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-tighter transition-all border ${
                      formData.criticality === r 
                        ? (r === 'Bajo' ? 'bg-green-500/20 border-green-500 text-green-500' : r === 'Medio' ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]') 
                        : 'border-border-subtle text-gray-500'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3">
              <button onClick={prevStep} className="w-full sm:flex-1 py-1.5 border border-border-subtle rounded-xl text-[9px] uppercase font-black hover:bg-white/5 transition-all order-2 sm:order-1 tracking-widest">Regresar</button>
              <button 
                onClick={handleFinish}
                className="w-full sm:flex-[2] btn-primary py-1.5 bg-brand-accent text-black hover:bg-yellow-500 shadow-xl shadow-brand-accent/20 order-1 sm:order-2 text-[9px] uppercase font-black tracking-widest"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
