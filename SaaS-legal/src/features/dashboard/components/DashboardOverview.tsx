'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  ArrowUpRight,
  Grape as Google,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAssessments, getContracts } from '@/features/legal-shield/actions';

export function DashboardOverview() {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    totalContracts: 0,
    highRiskCount: 0,
    complianceScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [allAssessments, setAllAssessments] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    async function loadData() {
      const assessmentsRes = await getAssessments();
      const contractsRes = await getContracts();

      if (assessmentsRes.success && contractsRes.success) {
        const assessments = assessmentsRes.data || [];
        const contracts = contractsRes.data || [];
        
        const highRisk = assessments.filter((a: any) => a.riskLevel === 'ALTO').length;
        const score = assessments.length > 0 
          ? Math.round(((assessments.length - highRisk) / assessments.length) * 100) 
          : 0;

        setStats({
          totalAssessments: assessments.length,
          totalContracts: contracts.length,
          highRiskCount: highRisk,
          complianceScore: score
        });

        setAllAssessments(assessments);
        setRecentAssessments(assessments.slice(-5).reverse());
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = stats.totalAssessments > 0;

  // Calculate dynamic bars for the chart
  const getChartBars = () => {
    if (!allAssessments.length) return [30, 20, 25, 15, 30, 20, 35, 25, 40]; // Baseline placeholder

    // Filter by period
    const now = new Date();
    const filtered = allAssessments.filter(a => {
      const date = new Date(a.createdAt);
      const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
      return diffDays <= selectedPeriod;
    });

    // If no data in period, show empty-ish trend
    if (filtered.length === 0) return [10, 10, 10, 10, 10, 10, 10, 10, 10];

    // Map assessments to 9 bars (we have 9 slots in the UI)
    // We take the compliance score of each assessment
    const scores = filtered.map(a => {
      // Calculate a pseudo-score if not present
      if (a.complianceScore) return a.complianceScore;
      // Fallback calculation
      const highRisk = a.riskLevel === 'ALTO' ? 1 : 0;
      return highRisk ? 40 : 90; 
    });

    // If we have more than 9, take the last 9
    // If fewer, pad from the left with low values
    const finalBars = [...scores].slice(-9);
    while (finalBars.length < 9) {
      finalBars.unshift(15); // Padding
    }
    return finalBars;
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-fade-in pb-2">
      {/* Welcome Header - Ultra-Compressed */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-white/5 pb-3">
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-white tracking-tight leading-tight">Panel de Control Legal</h1>
          <p className="text-[10px] text-gray-500 font-medium">
            {hasData 
              ? `Estado del blindaje SaaS (${stats.totalAssessments} análisis realizados)`
              : 'Bienvenido. Protege tu SaaS con blindaje legal resiliente.'}
          </p>
        </div>
      </header>

      {/* Stats Grid - Ultra-Tighter gap */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard 
          title="Análisis" 
          value={stats.totalAssessments} 
          icon={<Activity className="text-brand-primary" size={18} />}
          trend="Actualizado"
        />
        <StatCard 
          title="Contratos" 
          value={stats.totalContracts} 
          icon={<FileText className="text-brand-accent" size={18} />}
          trend="En total"
        />
        <StatCard 
          title="Cumplimiento" 
          value={`${stats.complianceScore}%`} 
          icon={<Shield className="text-brand-primary" size={18} />}
          trend={stats.complianceScore > 80 ? "Alto" : "Crítico"}
        />
        <StatCard 
          title="Alertas" 
          value={stats.highRiskCount} 
          icon={<AlertTriangle className="text-red-500" size={18} />}
          trend="Estado"
          isAlert={stats.highRiskCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Main Chart/Process Section - Fixed Compact Height */}
        <div className="xl:col-span-8 space-y-3">
          <div className="premium-card min-h-[260px] lg:min-h-[320px] flex flex-col !p-4 lg:!p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-3 bg-brand-primary rounded-full" />
                Tendencia de Seguridad
              </h3>
              <select 
                title="Periodo"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                className="bg-bg-dark border border-border-subtle text-[9px] font-bold uppercase py-1 px-2 rounded-lg outline-none w-full sm:w-auto cursor-pointer hover:border-brand-primary transition-colors focus:ring-1 focus:ring-brand-primary"
              >
                <option value={7}>7 Días</option>
                <option value={15}>15 Días</option>
                <option value={30}>30 Días</option>
              </select>
            </div>
            
            <div className={`flex-1 flex flex-col justify-center items-center text-center p-4 lg:p-6 border border-dashed border-border-subtle rounded-2xl bg-white/5 relative overflow-hidden ${!hasData ? 'border-brand-primary/20' : ''}`}>
               <div className="absolute inset-0 flex items-end justify-center opacity-10 pointer-events-none px-4 pb-12">
                 <div className="flex items-end gap-1 w-full h-1/2">
                   {getChartBars().map((h, i) => (
                     <motion.div 
                       key={i} 
                       initial={{ height: 0 }}
                       animate={{ height: `${h}%` }}
                       transition={{ duration: 0.5, delay: i * 0.05 }}
                       className="flex-1 bg-brand-primary rounded-t-sm" 
                     />
                   ))}
                 </div>
               </div>
               <div className="absolute -bottom-10 -right-5 w-40 h-40 bg-brand-accent/5 rounded-full blur-[60px]" />
               <div className={`w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-3 border border-brand-primary/20 ${!hasData ? 'animate-bounce' : ''}`}>
                 <Shield className="text-brand-primary" size={24} />
               </div>
               <h4 className="text-white font-black mb-1 text-base lg:text-lg tracking-tight">
                 {hasData ? 'Blindaje Activo' : 'SaaS Desprotegido'}
               </h4>
               <p className="text-gray-400 text-[9px] lg:text-[10px] max-w-sm leading-tight opacity-70">
                 {hasData 
                   ? 'Tendencia estable basada en tus últimos análisis.'
                   : 'Inicia tu blindaje técnico-legal para visualizar tendencias.'}
               </p>
               <button 
                 onClick={() => window.location.href = '/legal-shield?view=form'}
                 className="mt-4 btn-primary !px-8 !py-2.5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20" 
               >
                 Nuevo Análisis
               </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar - Refined balance */}
        <div className="xl:col-span-4 space-y-3">
          <div className="premium-card !p-5 h-full flex flex-col min-h-[300px]">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 border-b border-white/5 pb-3 flex items-center gap-2">
              Actividad Reciente
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            </h3>
            <div className="space-y-2 flex-1 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
              {recentAssessments.length > 0 ? (
                recentAssessments.map((item, idx) => (
                  <ActivityItem 
                    key={item.id}
                    title={item.industry || 'Análisis'}
                    time={new Date(item.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                    status={item.riskLevel}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                  <Activity size={24} className="mb-2 text-gray-600" />
                  <p className="text-gray-600 text-[10px] italic">Sin actividad reciente.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <a 
                href="/legal-shield?view=history"
                className="block w-full py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase text-gray-400 hover:text-white hover:bg-brand-primary/10 hover:border-brand-primary/30 transition-all text-center tracking-widest"
              >
                Historial Completo
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// StatCard with better spacing and responsive layout
function StatCard({ title, value, icon, trend, isAlert = false }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`premium-card !p-5 lg:!p-6 border-l-4 ${isAlert ? 'border-l-red-500' : 'border-l-brand-primary'} flex flex-col justify-between h-full group bg-gradient-to-br from-bg-card to-bg-dark/50`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-bg-dark rounded-lg border border-border-subtle group-hover:border-brand-primary/30 shadow-inner">
          {icon}
        </div>
        <span className={`text-[8px] font-black uppercase tracking-tight py-0.5 px-1.5 rounded-md bg-white/5 border border-white/5 ${isAlert ? 'text-red-400' : 'text-brand-primary'}`}>
          {trend}
        </span>
      </div>
      <div className="space-y-0.5">
        <p className="text-lg sm:text-xl font-black text-white tracking-tighter leading-tight">{value}</p>
        <h3 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider opacity-80 leading-tight">{title}</h3>
      </div>
    </motion.div>
  );
}

function ActivityItem({ title, time, status }: any) {
  const isHigh = status === 'ALTO';
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isHigh ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-brand-primary shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-gray-300 tracking-tight uppercase group-hover:text-white transition-colors leading-none">
          {title}
        </p>
        <p className="text-[9px] text-gray-600 font-bold mt-1 uppercase">{time}</p>
      </div>
      <span className={`text-[9px] font-black px-2 py-1 rounded-lg border shrink-0 ${isHigh ? 'border-red-500/20 text-red-500 bg-red-500/5' : 'border-brand-primary/20 text-brand-primary bg-brand-primary/5'}`}>
        {status}
      </span>
    </div>
  );
}

function QuickActionButton({ label, icon, href }: any) {
  return (
    <a 
      href={href}
      className="flex flex-col items-center justify-center p-2 bg-bg-dark border border-border-subtle rounded-lg hover:border-brand-accent group transition-all h-full gap-1 shadow-sm"
    >
      <div className="text-gray-500 group-hover:text-brand-accent group-hover:scale-110 transition-all">
        {icon}
      </div>
      <span className="text-[10px] font-black text-gray-500 uppercase group-hover:text-white transition-colors text-center tracking-wider">{label}</span>
    </a>
  );
}
