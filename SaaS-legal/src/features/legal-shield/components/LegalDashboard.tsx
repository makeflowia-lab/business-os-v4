'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { AlertTriangle, CheckCircle, FileText, Code, ShieldCheck, Activity, Brain, Download, FileSpreadsheet, Sparkles } from 'lucide-react';
import { ContractArchitect } from './ContractArchitect';
import { getTenantBranding } from '@/shared/lib/tenant-branding';
import { printContract, exportToCSV } from '../lib/export-utils';

interface Props {
  analysis: any;
  onReset: () => void;
  onGenerateContract: () => void;
}

export function LegalDashboard({ analysis, onReset, onGenerateContract }: Props) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const branding = getTenantBranding();

  // Dynamic compliance timeline based on analysis results
  const complianceTimeline = (() => {
    const critical: string[] = ['Cláusula de licencia de uso (no venta)'];
    const important: string[] = ['Logs de acceso y auditoría', 'Política de seguridad de la información'];
    const optimization: string[] = ['Registro INDAUTOR del código fuente'];

    if (analysis.personalData !== false) {
      critical.push('Banner de consentimiento explícito');
      critical.push('Aviso de Privacidad Integral (LFPDPPP)');
      important.push('Mecanismo de Derechos ARCO');
    }
    if (analysis.sensibleData) {
      critical.push('Consentimiento EXPRESO por escrito (datos sensibles)');
      important.push('Cifrado AES-256 en tránsito y reposo');
      important.push('Evaluación de Impacto en Protección de Datos (EIPD)');
      optimization.push('Registro ante INAI');
    }
    if (analysis.hasSLA) {
      important.push('Anexo SLA con métricas de uptime (99.9%)');
    }
    if (analysis.criticality === 'Alto') {
      critical.push('Plan de Recuperación ante Desastres (DRP)');
      important.push('Redundancia geográfica de servidores');
    }
    if (analysis.hasElectronicBilling) {
      important.push('Facturación CFDI 4.0 configurada');
    }
    optimization.push('Auditoría de seguridad externa');

    return [
      { category: 'Días 1-7 (Críticos)', items: critical },
      { category: 'Días 8-21 (Importante)', items: important },
      { category: 'Días 22-30 (Optimización)', items: optimization },
    ];
  })();

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true, 
      theme: 'dark',
      flowchart: { useMaxWidth: true }
    });
    if (mermaidRef.current) {
      mermaidRef.current.removeAttribute('data-processed');
      mermaid.contentLoaded();
    }
  }, [analysis.mermaidFlow]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportToCSV({ branding, analysis, timeline: complianceTimeline });
  };

  return (
    <div className="app-container w-full space-y-6 sm:space-y-10 pb-20 animate-fade-in px-0">
      {/* Top Header - Compact (Rule 4) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-bg-card p-5 sm:p-8 rounded-2xl border border-border-subtle gap-6 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-[var(--text-xl)] sm:text-[var(--text-2xl)] font-black text-white leading-tight tracking-tight">Ruta de Cumplimiento Legal</h1>
          <p className="text-[var(--text-sm)] text-gray-500 font-medium">Análisis basado en regulaciones de {analysis.country || 'México'} 2026</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 no-print w-full lg:w-auto">
          <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 text-xs sm:text-sm ${
            analysis.riskLevel === 'ALTO' ? 'bg-red-500/20 text-red-500' : 
            analysis.riskLevel === 'MEDIO' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
          }`}>
            {analysis.riskLevel === 'ALTO' ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
            Riesgo {analysis.riskLevel}
          </div>
          <button 
            onClick={onGenerateContract}
            className="flex-1 lg:flex-none btn-primary !py-2 !px-4"
          >
            <Sparkles size={16} /> Crear Contrato
          </button>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handlePrint}
              className="flex-1 sm:flex-none p-2 bg-bg-dark border border-border-subtle rounded-xl text-white hover:border-brand-primary transition-all flex items-center justify-center gap-2 text-xs font-bold"
            >
              <FileText size={16} className="text-brand-primary" /> PDF
            </button>
            <button 
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none p-2 bg-bg-dark border border-border-subtle rounded-xl text-white hover:border-brand-primary transition-all flex items-center justify-center gap-2 text-xs font-bold"
            >
              <FileSpreadsheet size={16} className="text-green-500" /> Excel
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Mermaid Diagram - Rule 9 (Scroll controlled) */}
        <div className="lg:col-span-2 premium-card overflow-hidden page-break flex flex-col">
          <h3 className="text-[var(--text-lg)] font-bold mb-4 sm:mb-6 flex items-center gap-2 uppercase tracking-widest leading-none">
            <Activity className="text-brand-primary" size={20} /> Ruta de Implementación
          </h3>
          <div className="flex-1 flex justify-start sm:justify-center items-center bg-white/5 rounded-2xl p-4 sm:p-8 min-h-[300px] overflow-x-auto custom-scrollbar">
            <div ref={mermaidRef} className="mermaid w-full min-w-[600px] lg:min-w-0 flex justify-center scale-90 sm:scale-100 transition-transform duration-500">
              {analysis.mermaidFlow}
            </div>
          </div>
        </div>

        {/* Alerts & Risk */}
        <div className="flex flex-col gap-6 sm:gap-8 page-break">
          <div className="premium-card bg-red-500/5 border-red-500/20">
            <h3 className="text-[var(--text-base)] sm:text-[var(--text-lg)] font-bold mb-4 text-red-500 flex items-center gap-2">
              <AlertTriangle size={20} /> Alertas Críticas
            </h3>
            <div className="space-y-3">
              {analysis.alerts.map((alert: string, i: number) => (
                <div key={i} className="p-3 bg-red-500/10 rounded-lg text-xs sm:text-sm border border-red-500/30 text-red-200">
                  {alert}
                </div>
              ))}
              {analysis.alerts.length === 0 && <p className="text-gray-400 text-xs italic">No se detectaron alertas críticas.</p>}
            </div>
          </div>

          <div className="premium-card flex-1">
            <h3 className="text-[var(--text-base)] sm:text-[var(--text-lg)] font-bold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" /> Obligaciones Legales
            </h3>
            <ul className="space-y-3">
              {analysis.obligations.map((obl: string, i: number) => (
                <li key={i} className="flex gap-3 text-xs sm:text-sm text-gray-300">
                  <span className="text-green-500">•</span> {obl}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 page-break">
        {/* Compliance Timeline */}
        <div className="premium-card">
          <h3 className="text-[var(--text-base)] sm:text-[var(--text-lg)] font-bold mb-6 flex items-center gap-2 uppercase tracking-[0.15em] leading-none shrink-0">
            <Activity className="text-brand-primary" size={20} /> Roadmap 2026
          </h3>
          <div className="space-y-6">
            {complianceTimeline.map((phase, idx) => (
              <div key={idx} className="border-l-2 border-border-subtle pl-4 py-1">
                <h4 className={`${
                  idx === 0 ? 'text-red-500' : idx === 1 ? 'text-yellow-500' : 'text-blue-500'
                } text-[10px] font-black uppercase mb-1`}>{phase.category}</h4>
                <ul className="text-xs sm:text-sm text-gray-300 space-y-1">
                  {phase.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* IP Strategy Suggestion */}
        <div className="premium-card border-brand-accent/20">
          <h3 className="text-[var(--text-base)] sm:text-[var(--text-lg)] font-bold mb-4 flex items-center gap-2">
            <Brain className="text-brand-accent" size={20} /> Estrategia de IP
          </h3>
          <div className="p-4 bg-brand-accent/5 rounded-lg border border-brand-accent/30 text-gray-200">
            <p className="text-xs sm:text-sm mb-4 leading-relaxed">
              <strong>Veredicto:</strong> El software para el sector de {analysis.industry || 'SaaS'} se protege mediante <strong>Derecho de Autor</strong> ante Indautor, salvo efecto técnico sustancial.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <div className="w-2 h-2 rounded-full bg-brand-accent" />
                <span>Registro Indautor (Vida + 100 años)</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <div className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                <span className="font-bold text-brand-primary">Estrategia: Derechos de Autor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 page-break">
        {/* Contract Architect */}
        <ContractArchitect industry={analysis.industry} businessModel={analysis.businessModel} />
        
        {/* Snippets Section */}
        <div className="premium-card">
          <h3 className="text-[var(--text-base)] sm:text-[var(--text-lg)] font-bold mb-4 flex items-center gap-2">
            <FileText className="text-brand-primary" size={20} /> Snippets de Privacidad
          </h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase font-black">Aviso Simplificado</p>
              <pre className="p-3 bg-bg-dark border border-border-subtle rounded-lg text-xs text-gray-400 whitespace-pre-wrap font-mono ring-1 ring-white/5">
                {analysis.snippets.privacySimplificado}
              </pre>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase font-black">Consent Checkbox</p>
              <pre className="p-3 bg-bg-dark border border-border-subtle rounded-lg text-xs text-gray-400 whitespace-pre-wrap font-mono ring-1 ring-white/5">
                {analysis.snippets.consentCheckbox}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-10">
        <button onClick={onReset} className="text-xs sm:text-sm text-gray-500 hover:text-white transition-colors underline underline-offset-4">
          Reiniciar Análisis Legal
        </button>
      </div>
    </div>
  );
}

