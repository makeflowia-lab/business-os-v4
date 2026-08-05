'use client';

import { History, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import { Assessment } from '../db/schema';

interface Props {
  assessments: Assessment[];
  onSelect: (assessment: Assessment) => void;
  onDelete: (id: number) => void;
  onNew: () => void;
}

export function AssessmentHistory({ assessments, onSelect, onDelete, onNew }: Props) {
  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este registro del historial?')) {
      onDelete(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-bg-card p-6 rounded-xl border border-border-subtle">
        <div className="flex items-center gap-3">
          <History className="text-brand-primary" size={24} />
          <h2 className="text-2xl font-bold text-white">Historial de Análisis</h2>
        </div>
        <button 
          onClick={onNew}
          className="btn-primary flex items-center gap-2"
        >
          Nuevo Análisis
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {assessments.length === 0 ? (
          <div className="premium-card text-center py-20">
            <p className="text-gray-400">No hay análisis previos registrados.</p>
          </div>
        ) : (
          assessments.map((item) => (
            <div 
              key={item.id}
              className="premium-card hover:border-brand-primary/50 cursor-pointer transition-all group"
              onClick={() => onSelect(item)}
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold uppercase tracking-wider text-sm">{item.industry}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.riskLevel === 'ALTO' ? 'bg-red-500/20 text-red-500' : 
                      item.riskLevel === 'MEDIO' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                    }`}>
                      RIESGO {item.riskLevel}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">Modelo: {item.businessModel} | País: {item.country}</p>
                  <div className="flex items-center gap-2 text-gray-500 text-[10px] mt-2">
                    <Calendar size={12} />
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-brand-primary/20 transition-colors">
                    <ExternalLink size={18} className="text-gray-400 group-hover:text-brand-primary" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
