'use client';

import { useState, useEffect, useRef } from 'react';
import { BookOpen, Link as LinkIcon, FileText, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { getResources, createResource, seedResources, deleteResource } from '../actions';
import { motion } from 'framer-motion';

interface Resource {
  id: number;
  title: string;
  url: string;
  type: string;
  description: string | null;
}

export function ResourcesLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    type: 'link',
    description: '',
  });

  useEffect(() => {
    const init = async () => {
      await seedResources();
      loadResources();
    };
    init();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    const res = await getResources();
    if (res.success && res.data) {
      setResources(res.data as Resource[]);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createResource(newResource);
    if (res.success) {
      setShowForm(false);
      setNewResource({ title: '', url: '', type: 'link', description: '' });
      loadResources();
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar este recurso?')) {
      const res = await deleteResource(id);
      if (res.success) {
        loadResources();
      }
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // En una app real, aquí subiríamos a Supabase Storage y obtendríamos la URL.
      // Aquí simulamos creando la entrada con el nombre del archivo.
      await createResource({
        title: file.name,
        url: '#', // Simulación: En producción usaría la URL del bucket
        type: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'documentation',
        description: `Archivo cargado en lote: ${file.name}`,
      });
    }
    setLoading(false);
    loadResources();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-bg-card p-6 rounded-xl border border-border-subtle gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="text-brand-primary" size={24} />
          <div>
            <h2 className="text-2xl font-bold text-white">Biblioteca de Recursos</h2>
            <p className="text-xs text-gray-500">Documentos maestros y archivos por país (Multi-Tenant)</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="file" 
            multiple 
            accept=".pdf,.doc,.docx"
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleBulkUpload}
            title="Subir archivos PDF"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Carga en Lote (PDF)
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2"
          >
            <LinkIcon size={18} /> Agregar Enlace
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card bg-brand-primary/5 border-brand-primary/20"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider">Nuevo Enlace / Recurso Manual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Título del Documento</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-bg-dark border border-border-subtle p-3 rounded-lg text-white"
                  placeholder="Ej. Normativa Protección de Datos - España"
                  value={newResource.title}
                  onChange={e => setNewResource({...newResource, title: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="resUrl" className="block text-xs font-bold text-gray-400 uppercase mb-1">URL (Drive / Web)</label>
                <input 
                  id="resUrl"
                  type="url" 
                  required
                  className="w-full bg-bg-dark border border-border-subtle p-3 rounded-lg text-white"
                  placeholder="https://drive.google.com/..."
                  value={newResource.url}
                  onChange={e => setNewResource({...newResource, url: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label htmlFor="resourceType" className="block text-xs font-bold text-gray-400 uppercase mb-1">Tipo de Recurso</label>
                <select 
                  id="resourceType"
                  aria-label="Tipo de Recurso"
                  className="w-full bg-bg-dark border border-border-subtle p-3 rounded-lg text-white"
                  value={newResource.type}
                  onChange={e => setNewResource({...newResource, type: e.target.value})}
                >
                  <option value="link">Enlace Web</option>
                  <option value="pdf">Documento PDF</option>
                  <option value="documentation">Documentación</option>
                </select>
              </div>
              <div>
                <label htmlFor="resDesc" className="block text-xs font-bold text-gray-400 uppercase mb-1">Descripción</label>
                <input 
                  id="resDesc"
                  type="text" 
                  className="w-full bg-bg-dark border border-border-subtle p-3 rounded-lg text-white"
                  placeholder="Contexto o país de aplicación"
                  value={newResource.description}
                  onChange={e => setNewResource({...newResource, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Guardando...' : 'Crear Recurso'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading && resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Sincronizando biblioteca...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.length === 0 && !showForm && (
            <div className="md:col-span-2 premium-card text-center py-20">
              <p className="text-gray-400 italic">No hay recursos cargados todavía.</p>
            </div>
          )}
          
          {resources.map((res) => (
            <div 
              key={res.id}
              className="premium-card hover:border-brand-primary transition-all group relative overflow-hidden flex items-start gap-4"
            >
              <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
                {res.type === 'pdf' ? <FileText size={24} /> : <LinkIcon size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <h3 className="font-bold text-white group-hover:text-brand-primary transition-colors flex items-center gap-2 truncate">
                      {res.title}
                      <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                  </a>
                  <button 
                    onClick={(e) => handleDelete(res.id, e)}
                    className="p-1.5 text-gray-600 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                    title="Eliminar recurso"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{res.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] uppercase font-bold text-gray-500">
                    {res.type}
                  </span>
                  {res.url === '#' && (
                    <span className="text-[9px] text-yellow-500/60 flex items-center gap-1">
                      ⚠️ Archivo Local
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="premium-card border-brand-accent/20 bg-brand-accent/5">
        <h3 className="font-bold text-brand-accent mb-4 flex items-center gap-2">
          💡 Guía Multi-País
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Puedes cargar documentos específicos por legislación. Al generar el contrato, el sistema priorizará los recursos que coincidan con el país detectado en el diagnóstico.
        </p>
        <ul className="space-y-3 text-sm text-gray-300">
          <li className="flex gap-2">
             <span className="text-brand-accent">•</span>
             <span><strong>Global</strong>: Los contratos 01-07 son la base estándar.</span>
          </li>
          <li className="flex gap-2">
             <span className="text-brand-accent">•</span>
             <span><strong>Personalizado</strong>: Sube archivos de España, Colombia o Chile para sobreescribir cláusulas locales.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
