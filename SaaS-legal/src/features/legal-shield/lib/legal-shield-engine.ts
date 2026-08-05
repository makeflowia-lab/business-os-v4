/**
 * Legal Shield Engine v2.0
 * Motor de Análisis de Riesgo Legal para SaaS (México 2026)
 * Basado en: LFPDPPP, Ley Federal de Derecho de Autor, Código de Comercio,
 * NOM-151, Ley FINTECH (si aplica), Ley General de Salud (si aplica)
 */

export type RiskLevel = 'ALTO' | 'MEDIO' | 'BAJO';

export interface AssessmentInput {
  // Provider Info
  providerLegalName: string;
  providerTaxId: string;
  providerAddress?: string;
  providerRepresentative?: string;
  providerEmail?: string;

  // Client Info
  clientLegalName?: string;
  clientTaxId?: string;
  clientAddress?: string;
  clientRepresentative?: string;
  clientEmail?: string;

  // SaaS Info
  productName: string;
  industry: string;
  serviceDescription?: string;
  jurisdiction: string;

  // Data Flags
  personalData: boolean;
  sensibleData: boolean;

  // Operations
  criticality: 'Bajo' | 'Medio' | 'Alto';
  hasSLA: boolean;
  hasElectronicBilling: boolean;
  businessModel: string;
}

export interface LegalOutput {
  riskLevel: RiskLevel;
  riskScore: number;
  obligations: string[];
  alerts: string[];
  mermaidFlow: string;
  snippets: {
    privacySimplificado: string;
    consentCheckbox: string;
    licenciaUso: string;
    responsabilidadLimitada: string;
  };
}

export function analyzeLegalRisk(input: AssessmentInput): LegalOutput {
  const {
    industry,
    personalData,
    sensibleData,
    criticality,
    hasSLA,
    hasElectronicBilling,
    productName,
    businessModel,
    jurisdiction,
    providerLegalName,
    serviceDescription,
  } = input;

  let riskScore = 10;
  const obligations: string[] = [];
  const alerts: string[] = [];
  const industryLower = (industry || '').toLowerCase();

  // ═══════════════════════════════════════════════════════
  // 1. OBLIGACIONES BASE (aplican a todo SaaS en México)
  // ═══════════════════════════════════════════════════════
  obligations.push('Cumplimiento LFPDPPP (Ley Federal de Protección de Datos Personales)');
  obligations.push('Ley Federal de Derecho de Autor - Registro de software ante Indautor');
  obligations.push('Código de Comercio Art. 89-114 (Comercio Electrónico)');
  obligations.push('NOM-151-SCFI-2002 (Conservación de mensajes de datos)');

  // ═══════════════════════════════════════════════════════
  // 2. ANÁLISIS POR INDUSTRIA REGULADA
  // ═══════════════════════════════════════════════════════
  if (industryLower.includes('salud') || industryLower.includes('health')) {
    riskScore += 30;
    obligations.push('NOM-024-SSA3 (Expediente Clínico Electrónico)');
    obligations.push('Ley General de Salud - Protección de datos clínicos');
    obligations.push('Consentimiento informado médico específico');
    alerts.push('🚨 SECTOR SALUD: Requiere consentimiento expreso para datos clínicos. Los expedientes médicos electrónicos deben cumplir NOM-024-SSA3 y conservarse mínimo 5 años.');
  }

  if (industryLower.includes('finanz') || industryLower.includes('fintech') || industryLower.includes('pago')) {
    riskScore += 30;
    obligations.push('Ley para Regular las Instituciones de Tecnología Financiera (Ley FINTECH)');
    obligations.push('Disposiciones CNBV para ITF');
    obligations.push('Ley para la Prevención del Lavado de Dinero (PLD)');
    obligations.push('Registro ante CONDUSEF como proveedor tecnológico');
    alerts.push('🚨 SECTOR FINANCIERO: Sujeto a Ley FINTECH y supervisión de CNBV. Requiere protocolos KYC/AML y reporte de operaciones inusuales a la UIF.');
  }

  if (industryLower.includes('legal')) {
    riskScore += 20;
    obligations.push('Secreto profesional abogado-cliente (privilegio legal)');
    obligations.push('Ley General de Archivos - Conservación documental');
    alerts.push('⚠️ SECTOR LEGAL: La información está protegida por secreto profesional. Se requieren controles de acceso estrictos y cifrado end-to-end.');
  }

  if (industryLower.includes('educ') || industryLower.includes('edtech')) {
    riskScore += 15;
    obligations.push('Ley General de los Derechos de Niñas, Niños y Adolescentes');
    obligations.push('Consentimiento parental para menores de edad');
    alerts.push('⚠️ SECTOR EDUCATIVO: Si la plataforma procesa datos de menores, se requiere consentimiento parental verificable conforme al Art. 7 LFPDPPP.');
  }

  if (industryLower.includes('commerce') || industryLower.includes('retail')) {
    riskScore += 10;
    obligations.push('Ley Federal de Protección al Consumidor (PROFECO)');
    obligations.push('NOM-247 (Prácticas de comercio electrónico)');
  }

  // ═══════════════════════════════════════════════════════
  // 3. ANÁLISIS DE DATOS PERSONALES
  // ═══════════════════════════════════════════════════════
  if (personalData) {
    riskScore += 15;
    obligations.push('Aviso de Privacidad Integral (Art. 15-18 LFPDPPP)');
    obligations.push('Aviso de Privacidad Simplificado (Art. 25 Reglamento LFPDPPP)');
    obligations.push('Mecanismo de Derechos ARCO (Art. 28 LFPDPPP)');
    obligations.push('Registro de transferencias y remisiones de datos');
    alerts.push('⚠️ DATOS PERSONALES: Debe implementar Aviso de Privacidad con finalidades específicas, mecanismos ARCO y procedimiento de revocación de consentimiento.');
  }

  if (sensibleData) {
    riskScore += 35;
    obligations.push('Consentimiento expreso y por escrito para datos sensibles (Art. 9 LFPDPPP)');
    obligations.push('Cifrado AES-256 en tránsito y reposo para datos sensibles');
    obligations.push('Evaluación de Impacto en Protección de Datos (EIPD)');
    obligations.push('Protocolo de notificación de vulneraciones de seguridad');
    obligations.push('Registro ante INAI si procesa datos a gran escala');
    alerts.push('🚨 DATOS SENSIBLES: Requiere consentimiento EXPRESO Y POR ESCRITO. El tratamiento sin consentimiento genera responsabilidad civil y penal. Implementar cifrado AES-256 obligatorio.');
  }

  // ═══════════════════════════════════════════════════════
  // 4. ANÁLISIS DE CRITICIDAD OPERATIVA
  // ═══════════════════════════════════════════════════════
  if (criticality === 'Alto') {
    riskScore += 25;
    obligations.push('Plan de Continuidad de Negocio (BCP) documentado');
    obligations.push('Plan de Recuperación ante Desastres (DRP) con RTO < 4 horas');
    obligations.push('Redundancia geográfica de servidores');
    obligations.push('Auditoría de seguridad semestral');
    alerts.push('🔥 CRITICIDAD ALTA: El servicio es operacionalmente vital. Se requiere DRP documentado, redundancia geográfica y SLA con penalizaciones específicas por incumplimiento.');
  } else if (criticality === 'Medio') {
    riskScore += 10;
    obligations.push('Plan básico de recuperación documentado');
    obligations.push('Backups automatizados diarios');
  }

  // ═══════════════════════════════════════════════════════
  // 5. ANÁLISIS OPERATIVO ADICIONAL
  // ═══════════════════════════════════════════════════════
  if (hasSLA) {
    obligations.push('Anexo SLA con métricas de uptime (99.9% recomendado)');
    obligations.push('Procedimiento de créditos por incumplimiento de SLA');
    obligations.push('Monitoreo de disponibilidad con reporting mensual');
  }

  if (hasElectronicBilling) {
    obligations.push('CFDI 4.0 conforme a disposiciones del SAT');
    obligations.push('Conservación de XMLs por 5 años fiscales');
    obligations.push('Cancelación de CFDI conforme a reglas vigentes');
  }

  // ═══════════════════════════════════════════════════════
  // 6. ANÁLISIS JURISDICCIONAL
  // ═══════════════════════════════════════════════════════
  if (jurisdiction !== 'México') {
    riskScore += 15;
    if (jurisdiction === 'USA') {
      obligations.push('Cumplimiento CCPA/CPRA (California Privacy Rights)');
      obligations.push('Cláusula de arbitraje internacional');
    } else if (jurisdiction === 'España') {
      obligations.push('Cumplimiento RGPD (Reglamento General de Protección de Datos UE)');
      obligations.push('Designación de Delegado de Protección de Datos (DPO)');
      obligations.push('Registro de actividades de tratamiento');
    } else if (jurisdiction === 'Colombia') {
      obligations.push('Ley 1581 de 2012 (Protección de Datos Colombia)');
      obligations.push('Registro ante SIC (Superintendencia de Industria y Comercio)');
    }
    alerts.push(`⚠️ JURISDICCIÓN EXTRANJERA (${jurisdiction}): El contrato debe contemplar transferencia internacional de datos y cumplimiento dual de normativas.`);
  }

  // ═══════════════════════════════════════════════════════
  // 7. CLASIFICACIÓN FINAL DE RIESGO
  // ═══════════════════════════════════════════════════════
  const riskLevel: RiskLevel = riskScore > 70 ? 'ALTO' : riskScore > 35 ? 'MEDIO' : 'BAJO';

  // ═══════════════════════════════════════════════════════
  // 8. GENERACIÓN DE FLOWCHART MERMAID
  // ═══════════════════════════════════════════════════════
  const name = productName || 'SaaS';
  const mermaidFlow = `
    graph TD
      A["${name}"] --> B{"Blindaje Legal 2026"}
      B --> C["Contrato Maestro MSSA"]
      B --> D["Licencia IP (Indautor)"]
      B --> E["NDA / Confidencialidad"]
      ${personalData ? `B --> F["Aviso de Privacidad LFPDPPP"]` : ''}
      ${personalData ? `F --> G["Derechos ARCO"]` : ''}
      ${sensibleData ? `B --> H["Protocolo Datos Sensibles"]` : ''}
      ${hasSLA ? `C --> I["Anexo SLA 99.9%"]` : ''}
      ${hasElectronicBilling ? `C --> J["Facturación CFDI 4.0"]` : ''}
      ${criticality === 'Alto' ? `C --> K["DRP / Continuidad"]` : ''}
      C --> L["Limitación Responsabilidad"]
      C --> M["Portabilidad y Borrado"]
      C --> N["Jurisdicción: ${jurisdiction || 'México'}"]
      
      style A fill:#0066FF,stroke:#fff,stroke-width:2px,color:#fff
      style B fill:#1a1a2e,stroke:#ffd700,stroke-width:2px,color:#ffd700
      style C fill:#00CC66,stroke:#fff,stroke-width:2px,color:#fff
      style D fill:#9333EA,stroke:#fff,stroke-width:2px,color:#fff
      style E fill:#F59E0B,stroke:#fff,stroke-width:2px,color:#000
      ${personalData ? `style F fill:#EF4444,stroke:#fff,stroke-width:2px,color:#fff` : ''}
      ${sensibleData ? `style H fill:#DC2626,stroke:#fff,stroke-width:3px,color:#fff` : ''}
  `.trim();

  // ═══════════════════════════════════════════════════════
  // 9. SNIPPETS LEGALES GENERADOS
  // ═══════════════════════════════════════════════════════
  const providerName = providerLegalName || '[NOMBRE DEL PROVEEDOR]';
  const desc = serviceDescription || productName || 'la plataforma SaaS';

  const snippets = {
    privacySimplificado: `AVISO DE PRIVACIDAD SIMPLIFICADO — ${providerName}, con domicilio en [DOMICILIO], es responsable del tratamiento de sus datos personales. Sus datos serán utilizados para: (i) la prestación del servicio "${name}", (ii) facturación y cobranza, (iii) soporte técnico. Para ejercer sus derechos ARCO o revocar su consentimiento, envíe solicitud a [EMAIL]. Aviso de Privacidad Integral disponible en [URL].`,

    consentCheckbox: sensibleData
      ? `"Otorgo mi consentimiento EXPRESO para el tratamiento de mis datos personales sensibles conforme al Aviso de Privacidad Integral de ${providerName}. Declaro haber sido informado de las finalidades del tratamiento y de mis derechos ARCO."`
      : `"Acepto el tratamiento de mis datos personales conforme al Aviso de Privacidad de ${providerName}. Conozco mis derechos ARCO y los mecanismos para ejercerlos."`,

    licenciaUso: `LICENCIA DE USO — ${providerName} otorga al CLIENTE una licencia de uso no exclusiva, no transferible, revocable y limitada al territorio de ${jurisdiction || 'México'} para acceder y utilizar "${name}" bajo la modalidad Software as a Service. El código fuente, algoritmos, bases de datos y toda la propiedad intelectual permanecen como propiedad exclusiva de ${providerName}. Queda estrictamente prohibida la ingeniería inversa, descompilación, sublicenciamiento o reproducción no autorizada.`,

    responsabilidadLimitada: `LIMITACIÓN DE RESPONSABILIDAD — La responsabilidad total acumulada de ${providerName} bajo este contrato no excederá el monto total efectivamente pagado por el CLIENTE durante los últimos doce (12) meses anteriores al evento que origina la reclamación. En ningún caso ${providerName} será responsable por: (a) daños indirectos, incidentales o consecuentes; (b) pérdida de beneficios, datos o interrupción de negocio; (c) fallas atribuibles a terceros o fuerza mayor. Esta limitación no aplica en caso de dolo o negligencia grave.`
  };

  return {
    riskLevel,
    riskScore,
    obligations,
    alerts,
    mermaidFlow,
    snippets
  };
}
