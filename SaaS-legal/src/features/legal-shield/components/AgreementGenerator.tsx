'use client';

import { useState, useEffect } from 'react';
import { FileText, Save, Check, Sparkles, Download, ShieldCheck, Printer, Building, FileType } from 'lucide-react';
import { motion } from 'framer-motion';
import { createContract } from '../actions';
import { 
  downloadAsMD, 
  downloadAsTxt, 
  downloadAsDocx, 
  printContract 
} from '../lib/export-utils';
import { SAAS_CONTRACT_TEMPLATES } from '../lib/knowledge-base';

interface Props {
  analysis?: any; // intakeData
  onSave?: () => void;
}

export function AgreementGenerator({ analysis, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [activeDocName, setActiveDocName] = useState('Documento Maestro');
  const [sections, setSections] = useState<any[]>([]);
  
  // Local state for fine-tuning data if needed, but primarily driven by 'analysis'
  const [contractData, setContractData] = useState<any>(null);

  useEffect(() => {
    if (analysis) {
      setContractData(analysis);
      
      // Auto-assemble when analysis is received
      const data = analysis;
      const resolve = (text: string) => {
        return text
          .replace(/{{PROVEEDOR_RAZON_SOCIAL}}/g, data.providerLegalName || '[PROVEEDOR]')
          .replace(/{{PROVEEDOR_REP}}/g, data.providerRepresentative || '[REP_PROVEEDOR]')
          .replace(/{{PROVEEDOR_RFC}}/g, data.providerTaxId || '[RFC_PROVEEDOR]')
          .replace(/{{PROVEEDOR_DOMICILIO}}/g, data.providerAddress || '[DOMICILIO_PROVEEDOR]')
          .replace(/{{PROVEEDOR_EMAIL}}/g, data.providerEmail || '[EMAIL_PROVEEDOR]')
          .replace(/{{CLIENTE_RAZON_SOCIAL}}/g, data.clientLegalName || '[CLIENTE]')
          .replace(/{{CLIENTE_REP}}/g, data.clientRepresentative || '[REP_CLIENTE]')
          .replace(/{{CLIENTE_RFC}}/g, data.clientTaxId || '[RFC_CLIENTE]')
          .replace(/{{CLIENTE_DOMICILIO}}/g, data.clientAddress || '[DOMICILIO_CLIENTE]')
          .replace(/{{PRODUCTO_NOMBRE}}/g, data.productName || '[PRODUCTO]')
          .replace(/{{JURISDICCION}}/g, data.jurisdiction || 'México')
          .replace(/{{DATOS_DESC}}/g, data.sensibleData ? 'Datos Personales y Sensibles' : 'Datos Personales Estándar');
      };

      const availableTemplates = SAAS_CONTRACT_TEMPLATES.filter(tpl => 
        tpl.condition ? tpl.condition(data) : true
      ).map(tpl => ({
        ...tpl,
        content: resolve(tpl.content)
      }));

      setSections(availableTemplates);
      
      if (availableTemplates.length > 0) {
        setSelectedDocId(availableTemplates[0].id);
        setGeneratedContent(availableTemplates[0].content);
        setActiveDocName(availableTemplates[0].name);
      }
    }
  }, [analysis]);

  const handleAssemble = () => {
    if (!contractData) return;

    const data = contractData;
    let assembledContent = '';

    const resolve = (text: string) => {
      return text
        .replace(/{{PROVEEDOR_RAZON_SOCIAL}}/g, data.providerLegalName || '[PROVEEDOR]')
        .replace(/{{PROVEEDOR_REP}}/g, data.providerRepresentative || '[REP_PROVEEDOR]')
        .replace(/{{PROVEEDOR_RFC}}/g, data.providerTaxId || '[RFC_PROVEEDOR]')
        .replace(/{{PROVEEDOR_DOMICILIO}}/g, data.providerAddress || '[DOMICILIO_PROVEEDOR]')
        .replace(/{{PROVEEDOR_EMAIL}}/g, data.providerEmail || '[EMAIL_PROVEEDOR]')
        .replace(/{{CLIENTE_RAZON_SOCIAL}}/g, data.clientLegalName || '[CLIENTE]')
        .replace(/{{CLIENTE_REP}}/g, data.clientRepresentative || '[REP_CLIENTE]')
        .replace(/{{CLIENTE_RFC}}/g, data.clientTaxId || '[RFC_CLIENTE]')
        .replace(/{{CLIENTE_DOMICILIO}}/g, data.clientAddress || '[DOMICILIO_CLIENTE]')
        .replace(/{{PRODUCTO_NOMBRE}}/g, data.productName || '[PRODUCTO]')
        .replace(/{{JURISDICCION}}/g, data.jurisdiction || 'México')
        .replace(/{{DATOS_DESC}}/g, data.sensibleData ? 'Datos Personales y Sensibles' : 'Datos Personales Estándar');
    };

    const templatesToUse = SAAS_CONTRACT_TEMPLATES.filter(tpl => 
      tpl.condition ? tpl.condition(data) : true
    );

    assembledContent = templatesToUse.map(tpl => {
      return `### ${tpl.name}\n\n${resolve(tpl.content)}`;
    }).join('\n\n---\n\n');

    const finalHeader = `============================================================
CONTRATO DE BLINDAJE LEGAL SaaS - MÉXICO 2026
GENERADO POR: SaaS LEGAL FACTORY V3
FECHA: ${new Date().toLocaleDateString('es-MX')}
============================================================\n\n`;

    const finalFooter = `\n\n============================================================
ACEPTACIÓN Y FIRMA DE LAS PARTES
============================================================
Por el PROVEEDOR:                          Por el CLIENTE:
__________________________                __________________________
{{PROVEEDOR_REP}}                         {{CLIENTE_REP}}
{{PROVEEDOR_RAZON_SOCIAL}}                {{CLIENTE_RAZON_SOCIAL}}`;

    setGeneratedContent(finalHeader + assembledContent + resolve(finalFooter));
    setActiveDocName('Contrato Consolidado');
    setSelectedDocId('consolidated');
  };

  const handleSave = async () => {
    if (!contractData || !generatedContent) return;
    setLoading(true);
    try {
      // Precise mapping to satisfy NOT NULL constraints in DB
      const res = await createContract({
        contractType: activeDocName,
        clientName: contractData.clientLegalName || 'Empresa Cliente',
        taxId: contractData.clientTaxId || 'XAXX010101000',
        fiscalAddress: contractData.clientAddress || 'Ciudad de México',
        legalName: contractData.providerLegalName || 'SaaS Provider',
        content: generatedContent,
        meta: { 
          analysisId: analysis?.id, 
          docName: activeDocName,
          representative: contractData.clientRepresentative,
          email: contractData.clientEmail,
          productName: contractData.productName,
          industry: contractData.industry
        }
      });
      
      if (res.success) {
        setSuccess(true);
        if (onSave) onSave(); // Refresh global contracts history
        setTimeout(() => setSuccess(false), 3000);
      } else {
        console.error('Save failed:', res.error);
        alert(`No se pudo guardar: ${res.error}`);
      }
    } catch (error) {
      console.error('Critical save error:', error);
      alert('Error en la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualExport = (type: 'md' | 'txt' | 'docx' | 'pdf') => {
    if (!generatedContent) return;
    const filename = `${activeDocName.replace(/\s+/g, '_')}_${contractData?.clientLegalName?.replace(/\s+/g, '_') || 'Draft'}`;
    
    switch (type) {
      case 'md': downloadAsMD(generatedContent, filename); break;
      case 'txt': downloadAsTxt(generatedContent, filename); break;
      case 'docx': downloadAsDocx(generatedContent, filename); break;
      case 'pdf': printContract(generatedContent, activeDocName); break;
    }
  };

  const saving = loading;
  const saved = success;

  if (!contractData) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center premium-card border-dashed border-2 border-border-subtle opacity-50">
        <Sparkles size={48} className="mx-auto mb-4 text-gray-500" />
        <h3 className="text-xl font-black uppercase text-gray-500">Esperando Datos de Intake</h3>
        <p className="text-sm text-gray-600">Completa el formulario anterior para iniciar el motor de blindaje.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-20 px-2 sm:px-0">
      {/* Header Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-bg-card p-4 sm:p-6 rounded-xl border border-border-subtle gap-4 animate-fade-in shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center border border-brand-primary/30">
            <ShieldCheck className="text-brand-primary" size={24} />
          </div>
          <div>
            <h2 className="text-[var(--text-base)] sm:text-[var(--text-lg)] font-black text-white">Ensamblado de Documentos</h2>
            <p className="text-gray-500 text-[10px] sm:text-xs uppercase font-bold tracking-widest">Motor de Blindaje 2026</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button 
            onClick={handleAssemble}
            className="flex-1 sm:flex-none btn-primary !py-2 !px-4"
          >
            <Sparkles size={18} /> ENSAMBLAR
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none btn-primary !py-2 !px-4"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {saved ? 'Guardado' : 'Guardar'}
          </button>
          
          <div className="h-8 w-px bg-border-subtle hidden xl:block mx-2" />

          {/* Export Group */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 xl:mt-0">
            <button 
              onClick={() => handleManualExport('docx')}
              title="Descargar Word (.doc)"
              className="flex-1 sm:flex-none p-2 bg-bg-dark border border-border-subtle rounded-xl text-white hover:border-brand-primary transition-all flex items-center justify-center gap-2 text-[10px] font-bold"
            >
              <FileType size={16} className="text-blue-400" /> WORD
            </button>
            <button 
              onClick={() => handleManualExport('pdf')}
              title="Descargar/Imprimir PDF"
              className="flex-1 sm:flex-none p-2 bg-bg-dark border border-border-subtle rounded-xl text-white hover:border-brand-primary transition-all flex items-center justify-center gap-2 text-[10px] font-bold"
            >
              <Printer size={16} className="text-red-400" /> PDF
            </button>
            <button 
              onClick={() => handleManualExport('txt')}
              title="Descargar Texto Plano (.txt)"
              className="flex-1 sm:flex-none p-2 bg-bg-dark border border-border-subtle rounded-xl text-white hover:border-brand-primary transition-all flex items-center justify-center gap-2 text-[10px] font-bold"
            >
              <FileText size={16} className="text-gray-400" /> TXT
            </button>
            <button 
              onClick={() => handleManualExport('md')}
              title="Descargar Markdown (.md)"
              className="flex-1 sm:flex-none p-2 bg-bg-dark border border-border-subtle rounded-xl text-white hover:border-brand-primary transition-all flex items-center justify-center gap-2 text-[10px] font-bold"
            >
              <Download size={16} className="text-brand-primary" /> MD
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Document Sidebar - Horizontal scroll on mobile */}
        <div className="lg:col-span-1 space-y-3 order-2 lg:order-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scroll-smooth">
          <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
            {sections.map((doc: any) => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDocId(doc.id);
                  setGeneratedContent(doc.content);
                  setActiveDocName(doc.name);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all w-full lg:max-w-none ${
                  selectedDocId === doc.id 
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-lg shadow-brand-primary/5' 
                    : 'border-border-subtle bg-bg-card/50 text-gray-500 hover:text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="flex-shrink-0">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-black truncate">{doc.name}</p>
                </div>
              </button>
            ))}
          </div>
          
          <div className="hidden lg:block premium-card border-brand-accent/20">
            <div className="flex items-center gap-2 text-brand-accent mb-2">
              <Sparkles size={14} />
              <span className="text-[10px] font-black uppercase">IA Advisor</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed italic">
              "Este documento incluye las cláusulas de limitación de responsabilidad adaptadas a la criticidad {analysis.criticality}."
            </p>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 space-y-4 order-1 lg:order-2">
          <div className="premium-card !p-0 overflow-hidden shadow-2xl border-brand-primary/10 ring-1 ring-white/5">
            <div className="bg-bg-card/80 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-border-subtle flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest truncate max-w-[150px] sm:max-w-none">
                  {activeDocName}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-border-subtle" />)}
              </div>
            </div>
            
            <textarea
              className="w-full h-[50vh] sm:h-[65vh] p-4 sm:p-8 bg-transparent text-white text-xs sm:text-sm font-mono leading-relaxed focus:outline-none resize-none custom-scrollbar"
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              spellCheck={false}
              aria-label={`Editor de ${activeDocName}`}
            />
            
            <div className="bg-bg-dark/50 px-4 sm:px-6 py-2 border-t border-border-subtle flex justify-between items-center">
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase">
                {generatedContent.length} carácteres | UTF-8 Legal Tech
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] text-brand-primary font-black uppercase tracking-tighter">Draft Protegido</span>
                <ShieldCheck size={12} className="text-brand-primary" />
              </div>
            </div>
          </div>
          
          {/* Mobile Advisor Info */}
          <div className="lg:hidden premium-card border-brand-accent/20 !p-4">
             <div className="flex items-center gap-2 text-brand-accent mb-1">
              <Sparkles size={14} />
              <span className="text-[10px] font-black uppercase">IA Advisor</span>
            </div>
            <p className="text-[10px] text-gray-400 italic">
              "Draft optimizado para {analysis.jurisdiction || 'México'} con enfoque en resiliencia SaaS."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
