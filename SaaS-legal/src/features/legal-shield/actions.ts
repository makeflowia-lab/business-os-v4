'use server';

import { db } from '@/shared/lib/db';
import { eq, and } from 'drizzle-orm';
import { assessments, contracts, resources, users, tenants, type NewAssessment, type RiskLevel } from './db/schema';
import { analyzeLegalRisk } from './lib/legal-shield-engine';
import { auth } from '@/auth';

// --- SESSION HELPER (unified with NextAuth) ---

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) return null;

  // Get user with tenantId from DB
  const [user] = await db.select().from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) return null;

  // Auto-provision tenant if user doesn't have one (first login via Magic Link)
  if (!user.tenantId) {
    const slug = (user.name || user.email!.split('@')[0]).toLowerCase().replace(/[^a-z0-9-]/g, '-') + '-' + Math.random().toString(36).substring(2, 5);
    const [tenant] = await db.insert(tenants).values({
      name: user.name ? `${user.name}'s Account` : `${user.email!.split('@')[0]}'s Account`,
      slug,
      branding: {
        name: user.name || 'Legal Shield',
        logo: '/logo.png',
        colors: { primary: '#0a84ff', accent: '#ffd700', background: '#000000' },
        email: user.email
      }
    }).returning();

    await db.update(users).set({ tenantId: tenant.id }).where(eq(users.id, user.id));
    return { id: user.id, name: user.name, email: user.email, tenantId: tenant.id };
  }

  return { id: user.id, name: user.name, email: user.email, tenantId: user.tenantId };
}

// --- LEGAL SHIELD ACTIONS ---

export async function createAssessment(data: Record<string, unknown>) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { success: false, error: 'Unauthorized' };

    const analysis = analyzeLegalRisk(data as any);
    
    const newAssessment: NewAssessment = {
      tenantId: user.tenantId,
      industry: (data.industry as string) || 'Tech',
      dataTypes: (data.dataTypes as string[]) || [],
      businessModel: (data.businessModel as string) || 'SaaS',
      paymentProcessor: (data.paymentProcessor as string) || 'Stripe',
      userBaseSize: (data.userBaseSize as string) || '0-1k',
      dataStorage: (data.dataStorage as string) || 'Cloud',
      thirdPartyIntegrations: (data.thirdPartyIntegrations as string[]) || [],
      country: (data.jurisdiction as string) || 'México',
      riskLevel: analysis.riskLevel as RiskLevel,
      obligations: analysis.obligations,
      flowchartData: analysis.mermaidFlow,
      legalSnippets: { ...analysis.snippets, alerts: analysis.alerts },
    };

    const [inserted] = await db.insert(assessments).values(newAssessment).returning();
    return { success: true, data: inserted, analysis };
  } catch (error) {
    console.error('Error creating assessment:', error);
    return { success: false, error: 'Failed to save assessment' };
  }
}

export async function getAssessments() {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { success: false, error: 'Unauthorized' };

    const results = await db.select().from(assessments)
      .where(eq(assessments.tenantId, user.tenantId))
      .orderBy(assessments.createdAt);
    return { success: true, data: results };
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return { success: false, error: 'Failed to fetch assessments' };
  }
}

export async function createContract(input: Record<string, unknown>) {
  const { contractType, clientName, taxId, fiscalAddress, legalName, content, meta, ...rest } = input;
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { success: false, error: 'Unauthorized' };

    const [inserted] = await db.insert(contracts).values({
      tenantId: user.tenantId,
      contractType: contractType as string,
      clientName: clientName as string,
      taxId: taxId as string,
      fiscalAddress: fiscalAddress as string,
      legalName: legalName as string,
      content: content as string,
      meta: { ...(meta as object || {}), ...rest },
    }).returning();
    return { success: true, data: inserted };
  } catch (error) {
    console.error('Error creating contract:', error);
    return { success: false, error: 'Failed to save contract' };
  }
}

export async function getContracts() {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { success: false, error: 'Unauthorized' };

    const results = await db.select().from(contracts)
      .where(eq(contracts.tenantId, user.tenantId))
      .orderBy(contracts.createdAt);
    return { success: true, data: results };
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return { success: false, error: 'Failed to fetch contracts' };
  }
}

export async function getResources() {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { success: false, error: 'Unauthorized' };

    const results = await db.select().from(resources)
      .where(eq(resources.tenantId, user.tenantId))
      .orderBy(resources.createdAt);
    return { success: true, data: results };
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { success: false, error: 'Failed to fetch resources' };
  }
}

export async function deleteResource(id: number) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { success: false, error: 'Unauthorized' };

    await db.delete(resources).where(and(eq(resources.id, id), eq(resources.tenantId, user.tenantId)));
    return { success: true };
  } catch (error) {
    console.error('Error deleting resource:', error);
    return { success: false };
  }
}

export async function deleteAssessment(id: number) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { success: false, error: 'Unauthorized' };

    await db.delete(assessments).where(and(eq(assessments.id, id), eq(assessments.tenantId, user.tenantId)));
    return { success: true };
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return { success: false };
  }
}

export async function deleteContract(id: number) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { success: false, error: 'Unauthorized' };

    await db.delete(contracts).where(and(eq(contracts.id, id), eq(contracts.tenantId, user.tenantId)));
    return { success: true };
  } catch (error) {
    console.error('Error deleting contract:', error);
    return { success: false };
  }
}

export async function createResource(input: { title: string; url: string; type: string; description?: string }) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { success: false, error: 'Unauthorized' };

    const [inserted] = await db.insert(resources).values({
      tenantId: user.tenantId,
      title: input.title,
      url: input.url,
      type: input.type,
      description: input.description || '',
    }).returning();
    return { success: true, data: inserted };
  } catch (error) {
    console.error('Error creating resource:', error);
    return { success: false, error: 'Failed to save resource' };
  }
}

export async function getTenantBranding() {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { success: false, error: 'Unauthorized' };

    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);
    return { success: true, data: tenant?.branding as any };
  } catch (error) {
    console.error('Error fetching branding:', error);
    return { success: false, error: 'Failed to fetch branding' };
  }
}

export async function updateTenantBranding(branding: { name: string; email?: string; colors: { primary: string; accent: string; background: string } }) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { success: false, error: 'Unauthorized' };

    await db.update(tenants).set({
      branding: { ...branding, logo: '/logo.png' },
      updatedAt: new Date(),
    }).where(eq(tenants.id, user.tenantId));
    return { success: true };
  } catch (error) {
    console.error('Error updating branding:', error);
    return { success: false, error: 'Failed to update branding' };
  }
}

export async function updateUserProfile(data: { name: string }) {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    await db.update(users)
      .set({ name: data.name })
      .where(eq(users.id, user.id));
    
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function seedResources() {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) return { success: false, error: 'Unauthorized' };

    const coreResources = [
      {
        title: '01_Contrato_Maestro_SaaS.pdf',
        url: 'https://drive.google.com/file/d/1F4xttilQ6eiGdeqtIkNjmqzLfOXWwoKZ/view?usp=drive_link',
        type: 'pdf',
        description: 'Contrato Maestro de Servicios SaaS (Cuerpo Principal).',
      },
      {
        title: '02_Acuerdo_Confidencialidad_Datos.pdf',
        url: 'https://drive.google.com/file/d/1hkdX6W0mcSgx1L5vtcLLEySwsd0NQzzI/view?usp=drive_link',
        type: 'pdf',
        description: 'Acuerdo de Confidencialidad y Protección de Datos Dinámico.',
      },
      {
        title: '03_Licencia_Uso_SaaS.pdf',
        url: 'https://drive.google.com/file/d/1dgsAODvMSVFuTVUx9i27ABkifirBt1rj/view?usp=drive_link',
        type: 'pdf',
        description: 'Licencia de Uso de Software as a Service (EULA).',
      },
      {
        title: '04_Acta_Entrega_SaaS.pdf',
        url: 'https://drive.google.com/file/d/1tHj1fi_0aiRTL7TgtD8gMzVDiVgqkmTk/view?usp=drive_link',
        type: 'pdf',
        description: 'Acta formal de entrega y recepción del servicio SaaS.',
      },
      {
        title: '05_Anexo_Tecnico_SLA.pdf',
        url: 'https://drive.google.com/file/d/1e1KCKTLBKECFpqUAy-uxxyKPHMTExkuN/view?usp=drive_link',
        type: 'pdf',
        description: 'Anexo Técnico y Acuerdo de Niveles de Servicio.',
      },
      {
        title: '06_Caratula_Resumen.pdf',
        url: 'https://drive.google.com/file/d/1o3hVLLzD_SCJX4cDz68WCuQtcpwwLnz6/view?usp=drive_link',
        type: 'pdf',
        description: 'Hoja resumen del contrato y datos clave de operación.',
      },
      {
        title: '07_Carta_Responsiva_Seguridad.pdf',
        url: 'https://drive.google.com/file/d/1sqYOv-yFn3GmuSpKwqeKhC5QvTEFOm-j/view?usp=sharing',
        type: 'pdf',
        description: 'Carta responsiva de seguridad de la información y accesos.',
      }
    ];

    for (const res of coreResources) {
      const existing = await db.select().from(resources)
        .where(and(eq(resources.title, res.title), eq(resources.tenantId, user.tenantId)))
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(resources).values({
          ...res,
          tenantId: user.tenantId
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error seeding data:', error);
    return { success: false };
  }
}
