'use client';

import { FileText, Calendar, Download, Trash2 } from 'lucide-react';
import { Contract } from '../db/schema';

interface Props {
  contracts: Contract[];
  onDelete: (id: number) => void;
}

export function ContractHistory({ contracts, onDelete }: Props) {
  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este contrato del historial?')) {
      onDelete(id);
    }
  };

  const handleDownload = (contract: Contract) => {
    const blob = new Blob([contract.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.contractType.replace(/\s+/g, '_')}_${contract.clientName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {contracts.length === 0 ? (
        <div className="premium-card text-center py-20">
          <p className="text-gray-400">No hay contratos guardados.</p>
        </div>
      ) : (
        contracts.map((item) => (
          <div 
            key={item.id}
            className="premium-card transition-all group border-l-4 border-brand-primary"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-white font-bold">{item.contractType}</h3>
                <p className="text-gray-400 text-sm">Cliente: <span className="text-gray-200">{item.clientName}</span> | RFC: <span className="text-gray-200 font-mono">{item.taxId}</span></p>
                <div className="flex items-center gap-2 text-gray-500 text-[10px] mt-2">
                  <Calendar size={12} />
                  {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownload(item)}
                  className="p-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg transition-colors flex items-center gap-2 text-xs"
                >
                  <Download size={16} /> Descargar TXT
                </button>
                <button 
                  onClick={(e) => handleDelete(e, item.id)}
                  title="Eliminar Contrato"
                  aria-label="Eliminar Contrato"
                  className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
