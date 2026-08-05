'use client';

import { FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Clause {
  id: string;
  title: string;
  transcription: string;
  snippet: string;
}

interface Props {
  industry: string;
  businessModel: string;
}

export function ContractArchitect({ industry, businessModel }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic clauses based on industry and business model
  const baseClauses: Clause[] = [
    {
      id: 'license',
      title: 'Cláusula de Licencia de Uso (No Venta)',
      transcription: '"Yo te presto la llave para que entres, pero la propiedad intelectual me sigue perteneciendo"',
      snippet: 'El Licenciatario recibe una licencia no exclusiva, revocable y no transferible para acceder a la Plataforma. El Licenciante conserva todos los derechos de propiedad intelectual sobre el código fuente, estructura y funcionalidades.'
    },
    {
      id: 'liability',
      title: 'Limitación de Responsabilidad',
      transcription: '"Mi responsabilidad llega hasta donde pagaste"',
      snippet: 'La responsabilidad total del Licenciante por cualquier reclamación relacionada con este Contrato no excederá el monto total pagado por el Licenciatario durante los últimos 12 meses. En ningún caso será responsable por daños indirectos o pérdida de beneficios.'
    },
    {
      id: 'data-deletion',
      title: 'Portabilidad y Borrado Post-Cancelación',
      transcription: '"Cuántos días tiene para bajar su información antes de que la borres"',
      snippet: 'Tras la cancelación, el Licenciatario tendrá 30 días calendario para descargar sus datos en formatos estándar (CSV, JSON). Transcurrido este plazo, los datos serán eliminados conforme a NIST 800-88.'
    },
  ];

  // Add industry-specific clauses
  const industryClauses: Clause[] = [];
  const ind = (industry || '').toLowerCase();

  if (ind.includes('salud') || ind.includes('health')) {
    industryClauses.push({
      id: 'health-data',
      title: 'Protección de Datos Clínicos (NOM-024)',
      transcription: '"Los expedientes médicos tienen protección especial por ley"',
      snippet: 'El tratamiento de datos clínicos cumplirá con la NOM-024-SSA3. Los expedientes clínicos electrónicos se conservarán mínimo 5 años. Se requiere consentimiento informado médico específico de cada paciente.'
    });
  }
  if (ind.includes('finanz') || ind.includes('fintech') || ind.includes('pago')) {
    industryClauses.push({
      id: 'fintech-compliance',
      title: 'Cumplimiento Ley FINTECH y PLD',
      transcription: '"Si manejas dinero, la CNBV y la UIF te están observando"',
      snippet: 'La plataforma implementará protocolos KYC (Conoce a tu Cliente) y AML (Anti-Lavado). Se reportarán operaciones inusuales a la UIF conforme a la Ley para la Prevención del Lavado de Dinero.'
    });
  }
  if (ind.includes('educ') || ind.includes('edtech')) {
    industryClauses.push({
      id: 'minors-protection',
      title: 'Protección de Menores de Edad',
      transcription: '"Si tus usuarios son menores, necesitas el OK de sus papás"',
      snippet: 'Conforme a la Ley General de los Derechos de Niñas, Niños y Adolescentes, se requiere consentimiento parental verificable para el tratamiento de datos de menores de edad. Se implementarán controles de edad en el registro.'
    });
  }
  if (ind.includes('legal')) {
    industryClauses.push({
      id: 'legal-privilege',
      title: 'Secreto Profesional Abogado-Cliente',
      transcription: '"Lo que el cliente le dice a su abogado es sagrado"',
      snippet: 'La información procesada está protegida por el privilegio abogado-cliente. Se implementará cifrado end-to-end y controles de acceso estrictos. Los empleados del proveedor no tendrán acceso al contenido de los documentos legales.'
    });
  }

  const clauses = [...baseClauses, ...industryClauses];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="premium-card space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="text-brand-accent" />
        <h3 className="text-xl font-bold text-white">Arquitectura Contractual (Híbrida)</h3>
      </div>
      
      <p className="text-sm text-gray-400">
        Basado en tu modelo de <span className="text-brand-primary font-medium">{businessModel || 'negocio'}</span> para la industria de <span className="text-brand-primary font-medium">{industry || 'software'}</span>, 
        estas son las cláusulas sugeridas para tu blindaje legal:
      </p>

      <div className="space-y-4">
        {clauses.map((clause) => (
          <div key={clause.id} className="bg-bg-dark border border-border-subtle rounded-xl p-5 group hover:border-brand-primary/50 transition-all">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-brand-accent font-semibold text-sm uppercase tracking-wider">{clause.title}</h4>
              <button 
                onClick={() => copyToClipboard(clause.snippet, clause.id)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                {copiedId === clause.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
            
            <div className="bg-white/5 p-3 rounded-lg mb-3 italic text-xs text-gray-400 border-l-2 border-brand-primary">
              &ldquo;{clause.transcription}&rdquo;
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed">
              {clause.snippet}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
