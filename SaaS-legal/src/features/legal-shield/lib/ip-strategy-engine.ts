export type IPStrategy = 'Copyright (Indautor)' | 'Patente (INPI)' | 'Secreto Industrial' | 'Estrategia Híbrida';

interface IPSuggestion {
  strategy: IPStrategy;
  reasoning: string;
  steps: string[];
}

export function analyzeIPStrategy(industry: string, features: string[], technicalEffect: boolean): IPSuggestion {
  if (technicalEffect) {
    return {
      strategy: 'Patente (INPI)',
      reasoning: 'Tu software genera un efecto técnico (optimización, IA de bajo nivel, encriptación). Esto califica como solución técnica ante el INPI.',
      steps: [
        'Redactar memoria técnica del invento',
        'Búsqueda de anterioridades en el INPI',
        'Presentar solicitud de patente (Protección por 20 años)'
      ]
    };
  }

  if (features.includes('algoritmo-core') || features.includes('formula-secreta')) {
    return {
      strategy: 'Secreto Industrial',
      reasoning: 'Si la clave de tu éxito es un proceso que puedes mantener oculto (ej. Coca-Cola), el secreto industrial te protege indefinidamente sin hacerlo público.',
      steps: [
        'Implementar controles de acceso estrictos',
        'Firma de NDAs con todos los involucrados',
        'Documentar el protocolo de custodia de información'
      ]
    };
  }

  return {
    strategy: 'Copyright (Indautor)',
    reasoning: 'Para SaaS estándar (gestión, retail, contabilidad), la ley mexicana lo protege como obra literaria. Es la protección base más sólida (Vida + 100 años).',
    steps: [
      'Registrar código fuente y binario ante Indautor',
      'Incluir leyendas de reserva de derechos',
      'Implementar licencias de uso no exclusivas'
    ]
  };
}
