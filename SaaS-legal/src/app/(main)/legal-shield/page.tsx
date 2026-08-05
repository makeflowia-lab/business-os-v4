'use client';

import { useState } from 'react';
import { IntakeForm } from '@/features/legal-shield/components/IntakeForm';
import { LegalDashboard } from '@/features/legal-shield/components/LegalDashboard';
import { analyzeLegalRisk } from '@/features/legal-shield/lib/legal-shield-engine';
import { LegalFooter } from '@/features/legal-shield/components/LegalFooter';
import { ShieldAlert } from 'lucide-react';

import { createAssessment, getAssessments, deleteAssessment, getContracts, deleteContract } from '@/features/legal-shield/actions';
import { AssessmentHistory } from '@/features/legal-shield/components/AssessmentHistory';
import { AgreementGenerator } from '@/features/legal-shield/components/AgreementGenerator';
import { ResourcesLibrary } from '@/features/legal-shield/components/ResourcesLibrary';
import { ConfigPanel } from '@/features/legal-shield/components/ConfigPanel';
import { ArcoExplanation } from '@/features/legal-shield/components/ArcoExplanation';
import { LegalDocumentView } from '@/features/legal-shield/components/LegalDocumentView';
import { ContractHistory } from '@/features/legal-shield/components/ContractHistory';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

type ViewType = 'form' | 'dashboard' | 'history' | 'contracts' | 'resources' | 'config' | 'privacy' | 'terms' | 'arco';

function LegalShieldContent() {
  const searchParams = useSearchParams();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const defaultView = (searchParams.get('view') as ViewType) || 'form';
  const [view, setView] = useState<ViewType>(defaultView);
  const [historyTab, setHistoryTab] = useState<'assessments' | 'contracts'>('assessments');

  useEffect(() => {
    loadHistory();
    const v = searchParams.get('view') as ViewType;
    if (v) setView(v);
  }, [searchParams]);

  const loadHistory = async () => {
    const assessmentsRes = await getAssessments();
    if (assessmentsRes.success && assessmentsRes.data) {
      setHistory(assessmentsRes.data);
    }
    const contractsRes = await getContracts();
    if (contractsRes.success && contractsRes.data) {
      setContracts(contractsRes.data);
    }
  };

  const handleDeleteHistory = async (id: number) => {
    const res = await deleteAssessment(id);
    if (res.success) {
      loadHistory();
    }
  };

  const handleDeleteContract = async (id: number) => {
    const res = await deleteContract(id);
    if (res.success) {
      loadHistory();
    }
  };

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await createAssessment(data);
      if (response.success) {
        setAnalysis({ 
          ...response.analysis, 
          ...data, // Pass all raw form data (provider, client, flags)
        });
        setView('dashboard');
        loadHistory(); // Refresh history
      } else {
        // Fallback to client-side
        const result = analyzeLegalRisk(data);
        setAnalysis({ ...result, ...data });
        setView('dashboard');
      }
    } catch (error) {
      console.error('Submission error:', error);
      const result = analyzeLegalRisk(data);
      setAnalysis({ ...result, ...data });
      setView('dashboard');
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectHistory = (item: any) => {
    const snippets = item.legalSnippets || {};
    const alerts = snippets.alerts || [];
    // Remove alerts from snippets to avoid duplication
    const { alerts: _removed, ...cleanSnippets } = snippets;
    
    setAnalysis({
      riskLevel: item.riskLevel,
      obligations: item.obligations || [],
      mermaidFlow: item.flowchartData,
      country: item.country,
      industry: item.industry,
      businessModel: item.businessModel,
      snippets: cleanSnippets,
      alerts,
    });
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-bg-dark text-white font-sans selection:bg-brand-primary/30 flex flex-col">
      <header className="border-b border-border-subtle px-6 py-2 bg-bg-dark/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <ShieldAlert className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">LEGAL<span className="text-brand-primary">SHIELD</span></h1>
              <p className="text-[9px] text-brand-accent font-bold uppercase tracking-widest leading-none">México 2026 Ready</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <button 
              onClick={() => setView('form')} 
              className={`${view === 'form' || view === 'dashboard' ? 'text-brand-primary' : 'hover:text-white'} transition-colors`}
            >
              Diagnóstico
            </button>
            <button 
              onClick={() => setView('contracts')} 
              className={`${view === 'contracts' ? 'text-brand-primary' : 'hover:text-white'} transition-colors`}
            >
              Contratos
            </button>
            <button 
              onClick={() => setView('resources')} 
              className={`${view === 'resources' ? 'text-brand-primary' : 'hover:text-white'} transition-colors`}
            >
              Recursos
            </button>
            <button 
              onClick={() => setView('history')} 
              className={`${view === 'history' ? 'text-brand-primary' : 'hover:text-white'} transition-colors`}
            >
              Historial
            </button>
            <button 
              onClick={() => setView('config')} 
              className={`${view === 'config' ? 'text-brand-primary' : 'hover:text-white'} transition-colors`}
            >
              Ajustes
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-2 lg:py-3 animate-fade-in">
        {!analysis && !loading && (
          <div className="text-center max-w-2xl mx-auto mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl font-black mb-0.5 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent leading-tight mt-1">
              Blindaje Legal SaaS en Segundos
            </h2>
            <p className="text-gray-400 text-[9px] sm:text-[10px]">
              Análisis, diagramas y contratos obligatorios en minutos.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[60vh] gap-4 sm:gap-6 px-4 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg sm:text-xl font-black animate-pulse text-brand-primary uppercase tracking-tighter">
              Analizando regulaciones mexicanas 2026...
            </p>
          </div>
        ) : (
          <div className="w-full h-full">
            {view === 'form' ? (
              <IntakeForm onSubmit={handleFormSubmit} />
            ) : view === 'history' ? (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex bg-bg-card p-1 rounded-xl border border-border-subtle w-fit mx-auto">
                  <button 
                    onClick={() => setHistoryTab('assessments')}
                    className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      historyTab === 'assessments' ? 'bg-brand-primary text-black shadow-lg' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Análisis
                  </button>
                  <button 
                    onClick={() => setHistoryTab('contracts')}
                    className={`px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      historyTab === 'contracts' ? 'bg-brand-primary text-black shadow-lg' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Contratos
                  </button>
                </div>

                {historyTab === 'assessments' ? (
                  <AssessmentHistory 
                    assessments={history} 
                    onSelect={handleSelectHistory} 
                    onDelete={handleDeleteHistory}
                    onNew={() => setView('form')} 
                  />
                ) : (
                  <ContractHistory 
                    contracts={contracts}
                    onDelete={handleDeleteContract}
                  />
                )}
              </div>
            ) : view === 'dashboard' ? (
              <LegalDashboard
                analysis={analysis}
                onReset={() => {
                  setAnalysis(null);
                  setView('form');
                }} 
                onGenerateContract={() => setView('contracts')}
              />
            ) : view === 'contracts' ? (
              <AgreementGenerator analysis={analysis} onSave={loadHistory} />
            ) : view === 'resources' ? (
              <ResourcesLibrary />
            ) : view === 'config' ? (
              <ConfigPanel />
            ) : view === 'arco' ? (
              <ArcoExplanation />
            ) : view === 'privacy' ? (
              <LegalDocumentView type="privacy" />
            ) : view === 'terms' ? (
              <LegalDocumentView type="terms" />
            ) : null}
          </div>
        )}
      </main>

      <LegalFooter onNavigate={(v) => setView(v as ViewType)} />
    </div>
  );
}

export default function LegalShieldPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LegalShieldContent />
    </Suspense>
  );
}
